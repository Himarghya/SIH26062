"""
ML #1 - Weather / Blizzard Risk Prediction (Classification)
Model: XGBoost Classifier
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

MODEL_DIR = Path(__file__).parent
FEATURES = [
    "temperature_c", "wind_speed_kmh", "wind_gust_kmh", "pressure_hpa",
    "pressure_change_3h", "visibility_m", "humidity_pct", "wind_chill_c",
]


def train(df: pd.DataFrame, save=True):
    X = df[FEATURES]
    y = df["blizzard_event"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, proba)
    report = classification_report(y_test, model.predict(X_test))
    print(f"[Blizzard Risk] AUC: {auc:.3f}")
    print(report)

    if save:
        joblib.dump(model, MODEL_DIR / "blizzard_risk_model.pkl")
    return model, auc


def _risk_label(prob: float) -> str:
    if prob >= 0.75:
        return "CRITICAL"
    if prob >= 0.5:
        return "HIGH"
    if prob >= 0.25:
        return "MODERATE"
    return "LOW"


def predict(model, station: str, **kwargs) -> dict:
    """
    kwargs must supply: temperature_c, wind_speed_kmh, wind_gust_kmh,
    pressure_hpa, pressure_change_3h, visibility_m, humidity_pct, wind_chill_c
    """
    row = pd.DataFrame([{f: kwargs[f] for f in FEATURES}])
    prob = float(model.predict_proba(row)[0, 1])

    visibility_risk = "HIGH" if kwargs["visibility_m"] < 1000 else (
        "MODERATE" if kwargs["visibility_m"] < 4000 else "LOW"
    )
    wind_risk = "HIGH" if kwargs["wind_gust_kmh"] > 90 else (
        "MODERATE" if kwargs["wind_gust_kmh"] > 50 else "LOW"
    )

    return {
        "station": station,
        "blizzard_probability_pct": round(prob * 100, 1),
        "visibility_risk": visibility_risk,
        "wind_risk": wind_risk,
        "predicted_risk": _risk_label(prob),
        "confidence_pct": round(max(prob, 1 - prob) * 100, 1),
    }


def load_model():
    path = MODEL_DIR / "blizzard_risk_model.pkl"
    if not path.exists():
        raise FileNotFoundError("Model not trained yet. Run train() first.")
    return joblib.load(path)


if __name__ == "__main__":
    import sys
    sys.path.append(str(MODEL_DIR.parent))
    from data_gen import generate_weather_data

    df = generate_weather_data()
    model, auc = train(df)

    example = predict(
        model, "Bharati",
        temperature_c=-38, wind_speed_kmh=95, wind_gust_kmh=130,
        pressure_hpa=955, pressure_change_3h=-6, visibility_m=250,
        humidity_pct=88, wind_chill_c=-55,
    )
    print(example)
