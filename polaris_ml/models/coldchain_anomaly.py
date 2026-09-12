"""
ML #3 - Cargo Cold-Chain Anomaly Detection (Unsupervised)
Model: Isolation Forest

Instead of a flat "temperature > threshold" rule, this detects abnormal
*trend* behaviour (rate of change, rolling volatility) in the temperature
stream so a breach can be flagged before the hard threshold is crossed.
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest

MODEL_DIR = Path(__file__).parent
WINDOW = 5  # rolling window size for engineered features


def _engineer_features(temps: np.ndarray) -> pd.DataFrame:
    s = pd.Series(temps)
    delta = s.diff().fillna(0)
    rolling_mean = s.rolling(WINDOW, min_periods=1).mean()
    rolling_std = s.rolling(WINDOW, min_periods=1).std().fillna(0)
    rolling_slope = s.diff(WINDOW).fillna(0) / WINDOW
    return pd.DataFrame({
        "temperature_c": s,
        "delta": delta,
        "rolling_mean": rolling_mean,
        "rolling_std": rolling_std,
        "rolling_slope": rolling_slope,
    })


def train(df: pd.DataFrame, save=True):
    """df: long-format frame with columns cargo_id, t_index, temperature_c"""
    all_feats = []
    for cargo_id, group in df.groupby("cargo_id"):
        feats = _engineer_features(group.sort_values("t_index")["temperature_c"].values)
        all_feats.append(feats)
    X = pd.concat(all_feats, ignore_index=True)

    model = IsolationForest(
        n_estimators=300,
        contamination=0.12,
        random_state=42,
    )
    model.fit(X)

    if save:
        joblib.dump(model, MODEL_DIR / "coldchain_anomaly_model.pkl")
    print(f"[Cold-Chain Anomaly] trained on {len(X)} points from {df['cargo_id'].nunique()} cargo series")
    return model


def score_stream(model, cargo_id: str, temps: list[float], target_temp_c: float, breach_margin_c=5.0):
    """
    Score the most recent point of a temperature stream.
    Returns an anomaly assessment + a naive time-to-breach estimate
    based on the current local slope.
    """
    feats = _engineer_features(np.array(temps))
    latest = feats.iloc[[-1]]

    raw_score = model.decision_function(latest)[0]   # higher = more normal
    anomaly_score = float(np.clip((0.5 - raw_score) * 2, 0, 1))  # rescale to 0-1, higher = more anomalous
    is_anomaly = model.predict(latest)[0] == -1

    current_temp = temps[-1]
    slope_per_step = float(latest["rolling_slope"].iloc[0])  # deg C per step
    breach_temp = target_temp_c + breach_margin_c

    eta_steps = None
    if slope_per_step > 0.01 and current_temp < breach_temp:
        eta_steps = (breach_temp - current_temp) / slope_per_step

    return {
        "cargo_id": cargo_id,
        "current_temperature_c": round(current_temp, 2),
        "target_temp_c": target_temp_c,
        "trend_anomaly_detected": bool(is_anomaly),
        "anomaly_score": round(anomaly_score, 2),
        "estimated_steps_to_breach": round(eta_steps, 1) if eta_steps else None,
        "action": "Inspect cryogenic container" if is_anomaly else "Normal - continue monitoring",
    }


def load_model():
    path = MODEL_DIR / "coldchain_anomaly_model.pkl"
    if not path.exists():
        raise FileNotFoundError("Model not trained yet. Run train() first.")
    return joblib.load(path)


if __name__ == "__main__":
    import sys
    sys.path.append(str(MODEL_DIR.parent))
    from data_gen import generate_coldchain_data

    df = generate_coldchain_data()
    model = train(df)

    # simulate a warming-trend cargo stream (like the example in the spec)
    stream = [-80, -79, -80, -81, -80, -79, -77, -74, -70, -68]
    result = score_stream(model, "ICE-CORE-204", stream, target_temp_c=-80)
    print(result)
