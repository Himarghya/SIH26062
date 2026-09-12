"""
POLARIS ML - Synthetic Data Generator
======================================
Generates plausible synthetic telemetry for the 4 ML components:
  1. Weather / Blizzard Risk       (classification)
  2. Fuel & Inventory Forecasting  (regression / time series)
  3. Cold-Chain Anomaly Detection  (unsupervised anomaly detection)
  4. SAR / Asset Risk              (classification + ranking)

Replace this module with real station telemetry once available -
every model file below expects a pandas DataFrame with the same
column names produced here, so swapping in real data is a drop-in
replacement.
"""

import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

STATIONS = ["Bharati", "Maitri", "Dakshin_Gangotri"]


# ---------------------------------------------------------------------
# 1. WEATHER / BLIZZARD RISK DATA
# ---------------------------------------------------------------------
def generate_weather_data(n=6000):
    temp = RNG.normal(-25, 15, n)
    wind_speed = np.clip(RNG.gamma(4, 8, n), 0, 220)
    wind_gust = wind_speed + np.clip(RNG.normal(15, 10, n), 0, None)
    pressure = RNG.normal(980, 20, n)
    pressure_change = RNG.normal(0, 4, n)  # hPa/3h
    visibility = np.clip(RNG.normal(6000, 4000, n), 20, 20000)
    humidity = np.clip(RNG.normal(75, 15, n), 10, 100)
    wind_chill = temp - 0.7 * wind_speed / 10

    # latent "danger score" drives label — mixes several factors non-linearly
    danger = (
        0.03 * wind_gust
        + 0.15 * np.maximum(0, -pressure_change)
        + 0.0009 * (8000 - visibility)
        + 0.02 * (humidity - 50)
        - 0.02 * temp
    )
    danger += RNG.normal(0, 1.5, n)
    blizzard = (danger > np.quantile(danger, 0.80)).astype(int)

    df = pd.DataFrame({
        "station": RNG.choice(STATIONS, n),
        "temperature_c": temp,
        "wind_speed_kmh": wind_speed,
        "wind_gust_kmh": wind_gust,
        "pressure_hpa": pressure,
        "pressure_change_3h": pressure_change,
        "visibility_m": visibility,
        "humidity_pct": humidity,
        "wind_chill_c": wind_chill,
        "blizzard_event": blizzard,
    })
    df.to_csv(DATA_DIR / "weather.csv", index=False)
    return df


# ---------------------------------------------------------------------
# 2. FUEL / INVENTORY CONSUMPTION DATA (time series -> regression)
# ---------------------------------------------------------------------
def generate_fuel_data(n_days=1500):
    station = RNG.choice(STATIONS, n_days)
    temp = RNG.normal(-25, 12, n_days)
    wind = np.clip(RNG.gamma(4, 8, n_days), 0, 200)
    personnel = RNG.integers(15, 90, n_days)
    generator_load_pct = np.clip(RNG.normal(60, 15, n_days), 10, 100)
    blizzard_flag = RNG.binomial(1, 0.15, n_days)
    equipment_usage_hrs = np.clip(RNG.normal(10, 4, n_days), 0, 24)

    # burn rate model (L/day) — colder + windier + more load => higher burn
    base_burn = (
        800
        + 12 * (-temp)
        + 4 * wind
        + 9 * personnel
        + 15 * generator_load_pct
        + 300 * blizzard_flag
        + 20 * equipment_usage_hrs
    )
    noise = RNG.normal(0, 250, n_days)
    burn_rate_l_day = np.clip(base_burn + noise, 300, None)

    df = pd.DataFrame({
        "station": station,
        "temperature_c": temp,
        "wind_speed_kmh": wind,
        "personnel_count": personnel,
        "generator_load_pct": generator_load_pct,
        "blizzard_flag": blizzard_flag,
        "equipment_usage_hrs": equipment_usage_hrs,
        "fuel_burn_l_day": burn_rate_l_day,
    })
    df.to_csv(DATA_DIR / "fuel.csv", index=False)
    return df


# ---------------------------------------------------------------------
# 3. COLD-CHAIN TEMPERATURE STREAM (unsupervised anomaly detection)
# ---------------------------------------------------------------------
def generate_coldchain_data(n_series=40, length=120, target_temp=-80):
    rows = []
    for series_id in range(n_series):
        cargo_id = f"CARGO-{1000+series_id}"
        is_anomalous_series = RNG.random() < 0.15
        t = target_temp + RNG.normal(0, 0.4, length).cumsum() * 0.02  # slow drift baseline
        t += RNG.normal(0, 0.3, length)  # sensor noise

        if is_anomalous_series:
            # inject a warming trend anomaly starting at a random point
            start = RNG.integers(length // 2, length - 20)
            ramp = np.linspace(0, RNG.uniform(8, 20), length - start)
            t[start:] += ramp

        for i, temp in enumerate(t):
            rows.append({
                "cargo_id": cargo_id,
                "t_index": i,
                "temperature_c": temp,
                "target_temp_c": target_temp,
                "is_anomalous_series": int(is_anomalous_series),
            })
    df = pd.DataFrame(rows)
    df.to_csv(DATA_DIR / "coldchain.csv", index=False)
    return df


# ---------------------------------------------------------------------
# 4. SAR / ASSET RISK DATA (classification + suitability ranking)
# ---------------------------------------------------------------------
def generate_sar_data(n=4000):
    distance_km = np.clip(RNG.gamma(3, 15, n), 1, 250)
    visibility_m = np.clip(RNG.normal(3000, 3000, n), 20, 20000)
    wind_kmh = np.clip(RNG.gamma(4, 10, n), 0, 220)
    temp_c = RNG.normal(-30, 12, n)
    personnel_available = RNG.integers(2, 40, n)
    asset_fuel_pct = np.clip(RNG.normal(65, 20, n), 5, 100)
    asset_type = RNG.choice(["helicopter", "snowcat", "vessel"], n)
    time_since_contact_hr = np.clip(RNG.exponential(3, n), 0, 48)

    risk_score = (
        0.015 * distance_km
        + 0.0006 * (8000 - visibility_m)
        + 0.02 * wind_kmh
        - 0.01 * temp_c
        + 0.04 * time_since_contact_hr
        - 0.01 * asset_fuel_pct
    )
    risk_score += RNG.normal(0, 2, n)
    critical = (risk_score > np.quantile(risk_score, 0.75)).astype(int)

    df = pd.DataFrame({
        "distance_km": distance_km,
        "visibility_m": visibility_m,
        "wind_kmh": wind_kmh,
        "temperature_c": temp_c,
        "personnel_available": personnel_available,
        "asset_fuel_pct": asset_fuel_pct,
        "asset_type": asset_type,
        "time_since_contact_hr": time_since_contact_hr,
        "critical_response": critical,
    })
    df.to_csv(DATA_DIR / "sar.csv", index=False)
    return df


def generate_all():
    w = generate_weather_data()
    f = generate_fuel_data()
    c = generate_coldchain_data()
    s = generate_sar_data()
    print(f"weather.csv   -> {w.shape}")
    print(f"fuel.csv      -> {f.shape}")
    print(f"coldchain.csv -> {c.shape}")
    print(f"sar.csv       -> {s.shape}")


if __name__ == "__main__":
    generate_all()
