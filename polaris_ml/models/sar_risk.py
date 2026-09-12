"""
ML #4 - SAR / Emergency Risk Prediction + Asset Suitability Ranking
Model: XGBoost Classifier (risk) + weighted scoring (asset ranking)
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

MODEL_DIR = Path(__file__).parent
NUM_FEATURES = [
    "distance_km", "visibility_m", "wind_kmh", "temperature_c",
    "personnel_available", "asset_fuel_pct", "time_since_contact_hr",
]
CAT_FEATURES = ["asset_type"]


def train(df: pd.DataFrame, save=True):
    X = df[NUM_FEATURES + CAT_FEATURES]
    y = df["critical_response"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocess = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES),
    ], remainder="passthrough")

    pipeline = Pipeline([
        ("prep", preprocess),
        ("clf", XGBClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            eval_metric="logloss", random_state=42,
        )),
    ])
    pipeline.fit(X_train, y_train)

    proba = pipeline.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, proba)
    print(f"[SAR Risk] AUC: {auc:.3f}")
    print(classification_report(y_test, pipeline.predict(X_test)))

    if save:
        joblib.dump(pipeline, MODEL_DIR / "sar_risk_model.pkl")
    return pipeline, auc


def _risk_label(prob):
    if prob >= 0.75:
        return "CRITICAL"
    if prob >= 0.5:
        return "HIGH"
    if prob >= 0.25:
        return "MODERATE"
    return "LOW"


def predict_incident_risk(model, incident_id: str, **kwargs) -> dict:
    row = pd.DataFrame([{f: kwargs[f] for f in NUM_FEATURES + CAT_FEATURES}])
    prob = float(model.predict_proba(row)[0, 1])

    # crude estimated response time: base time scaled by distance & weather friction
    friction = 1 + (kwargs["wind_kmh"] / 150) + max(0, (2000 - kwargs["visibility_m"]) / 2000)
    est_minutes = kwargs["distance_km"] * 2.2 * friction

    return {
        "incident_id": incident_id,
        "response_risk_pct": round(prob * 100, 1),
        "estimated_response_time_min": round(est_minutes, 0),
        "risk_level": _risk_label(prob),
    }


def rank_assets(assets: list[dict]) -> list[dict]:
    """
    assets: list of dicts each with distance_km, fuel_pct, weather_compat_pct
            (0-100), availability ("READY"/"WEATHER_LIMITED"/"MAINTENANCE"),
            payload_ok (bool), name
    Weighted suitability score, higher is better.
    """
    weights = dict(distance=0.30, fuel=0.20, weather=0.30, availability=0.20)
    max_distance = max(a["distance_km"] for a in assets) or 1

    ranked = []
    for a in assets:
        distance_score = (1 - a["distance_km"] / max_distance) * 100
        availability_score = {
            "READY": 100, "WEATHER_LIMITED": 40, "MAINTENANCE": 0,
        }.get(a.get("availability", "READY"), 50)

        suitability = (
            weights["distance"] * distance_score
            + weights["fuel"] * a["fuel_pct"]
            + weights["weather"] * a["weather_compat_pct"]
            + weights["availability"] * availability_score
        )
        if not a.get("payload_ok", True):
            suitability *= 0.5  # heavy penalty if payload requirement unmet

        ranked.append({
            "name": a["name"],
            "suitability_pct": round(suitability, 1),
            "distance_km": a["distance_km"],
            "fuel_pct": a["fuel_pct"],
            "weather_compatibility_pct": a["weather_compat_pct"],
            "availability": a.get("availability", "READY"),
        })

    return sorted(ranked, key=lambda r: r["suitability_pct"], reverse=True)


def load_model():
    path = MODEL_DIR / "sar_risk_model.pkl"
    if not path.exists():
        raise FileNotFoundError("Model not trained yet. Run train() first.")
    return joblib.load(path)


if __name__ == "__main__":
    import sys
    sys.path.append(str(MODEL_DIR.parent))
    from data_gen import generate_sar_data

    df = generate_sar_data()
    model, auc = train(df)

    incident = predict_incident_risk(
        model, "Field-Team-07",
        distance_km=43, visibility_m=180, wind_kmh=104,
        temperature_c=-39, personnel_available=6,
        asset_fuel_pct=70, time_since_contact_hr=5, asset_type="snowcat",
    )
    print(incident)

    ranking = rank_assets([
        dict(name="Helicopter A", distance_km=80, fuel_pct=75,
             weather_compat_pct=45, availability="WEATHER_LIMITED"),
        dict(name="Snowcat B", distance_km=31, fuel_pct=82,
             weather_compat_pct=94, availability="READY"),
        dict(name="Snowcat C", distance_km=47, fuel_pct=60,
             weather_compat_pct=88, availability="READY"),
    ])
    print(ranking)
