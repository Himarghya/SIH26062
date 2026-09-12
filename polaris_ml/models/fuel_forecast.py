"""
ML #2 - Fuel & Inventory Consumption Forecasting (Regression)
Model: XGBoost Regressor

Predicts daily burn rate (L/day) from current operating conditions,
then projects stock levels forward and estimates a stockout date.
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

MODEL_DIR = Path(__file__).parent
FEATURES = [
    "temperature_c", "wind_speed_kmh", "personnel_count",
    "generator_load_pct", "blizzard_flag", "equipment_usage_hrs",
]


def train(df: pd.DataFrame, save=True):
    X = df[FEATURES]
    y = df["fuel_burn_l_day"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = XGBRegressor(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"[Fuel Forecast] MAE: {mae:.1f} L/day | R2: {r2:.3f}")

    if save:
        joblib.dump(model, MODEL_DIR / "fuel_forecast_model.pkl")
    return model, mae, r2


def forecast(
    model,
    station: str,
    current_stock_l: float,
    conditions: dict,
    horizon_days=(7, 14, 21, 30),
    resupply_in_days: int | None = None,
):
    """
    conditions: dict with keys matching FEATURES, representing the
    *expected average* operating condition over the forecast horizon.
    For a production system you'd feed a per-day forecast (e.g. from
    the weather model) instead of a single averaged condition.
    """
    row = pd.DataFrame([{f: conditions[f] for f in FEATURES}])
    predicted_burn = float(model.predict(row)[0])

    projection = {}
    stock = current_stock_l
    exhaustion_day = None
    for day in range(1, max(horizon_days) + 1):
        stock -= predicted_burn
        if day in horizon_days:
            projection[f"day_{day}"] = round(max(stock, 0), 0)
        if stock <= 0 and exhaustion_day is None:
            exhaustion_day = day

    risk = "LOW"
    if exhaustion_day is not None:
        if resupply_in_days and exhaustion_day <= resupply_in_days:
            risk = "CRITICAL"
        elif exhaustion_day <= 20:
            risk = "HIGH"
        elif exhaustion_day <= 40:
            risk = "MODERATE"

    return {
        "station": station,
        "current_stock_l": current_stock_l,
        "predicted_burn_l_per_day": round(predicted_burn, 0),
        "projection": projection,
        "predicted_exhaustion_day": exhaustion_day,
        "next_resupply_in_days": resupply_in_days,
        "risk": risk,
    }


def load_model():
    path = MODEL_DIR / "fuel_forecast_model.pkl"
    if not path.exists():
        raise FileNotFoundError("Model not trained yet. Run train() first.")
    return joblib.load(path)


if __name__ == "__main__":
    import sys
    sys.path.append(str(MODEL_DIR.parent))
    from data_gen import generate_fuel_data

    df = generate_fuel_data()
    model, mae, r2 = train(df)

    result = forecast(
        model, "Bharati",
        current_stock_l=72400,
        conditions=dict(
            temperature_c=-32, wind_speed_kmh=60, personnel_count=55,
            generator_load_pct=70, blizzard_flag=0, equipment_usage_hrs=12,
        ),
        resupply_in_days=26,
    )
    print(result)
