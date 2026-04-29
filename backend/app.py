from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import pandas as pd
import json
import joblib
import numpy as np
import tensorflow as tf
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_jsonable(value):
    if isinstance(value, dict):
        return {k: to_jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [to_jsonable(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if pd.isna(value):
        return None
    return value

class LoginData(BaseModel):
    username: str
    password: str

@app.get("/")
def root():
    return RedirectResponse("http://127.0.0.1:5173/")

@app.post("/api/login")
def login(data: LoginData):
    if data.username == "admin" and data.password == "admin123":
        return {"token": "dummy-token-admin", "role": "admin"}
    elif data.username == "analyst" and data.password == "analyst123":
        return {"token": "dummy-token-analyst", "role": "analyst"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

def load_data():
    try:
        return pd.read_csv(BASE_DIR / 'dashboard_data.csv')
    except Exception as e:
        df = pd.DataFrame()
        return df

@app.get("/api/dashboard/metrics")
def get_metrics():
    df = load_data()
    if df.empty:
        return {}

    total_customers = len(df)
    churned_customers = len(df[df['Churn'] == 'Yes'])
    churn_rate = (churned_customers / total_customers) * 100 if total_customers > 0 else 0
    
    # Calculate revenue and loss
    # Let's say MonthlyCharges represents current revenue
    total_revenue = df['MonthlyCharges'].sum()
    
    # Revenue lost from actual churned customers
    revenue_lost = df[df['Churn'] == 'Yes']['MonthlyCharges'].sum()
    
    # Expected Revenue Loss from current high risk customers (not yet churned but high probability)
    # Using probability * MonthlyCharges for unchurned customers
    active_df = df[df['Churn'] == 'No']
    expected_loss = (active_df['Churn_Prob'] * active_df['MonthlyCharges']).sum()

    return to_jsonable({
        "total_customers": total_customers,
        "churn_rate": round(churn_rate, 2),
        "total_revenue": round(total_revenue, 2),
        "revenue_lost": round(revenue_lost, 2),
        "expected_loss": round(expected_loss, 2)
    })

@app.get("/api/dashboard/charts")
def get_charts():
    df = load_data()
    if df.empty:
        return {}

    # Churn distribution
    churn_counts = df['Churn'].value_counts().to_dict()
    
    # Risk levels distribution for current active customers
    active_df = df[df['Churn'] == 'No']
    risk_counts = active_df['Risk_Level'].value_counts().to_dict()

    # Revenue Loss grouped by Payment Method
    revenue_loss_by_payment = df[df['Churn'] == 'Yes'].groupby('PaymentMethod')['MonthlyCharges'].sum().to_dict()

    # Total Charges scatter (sample because it might be too large)
    # We send a binned version of tenure vs total charges for high vs low risk
    
    return to_jsonable({
        "churn_distribution": churn_counts,
        "active_risk_distribution": risk_counts,
        "revenue_loss_by_payment": revenue_loss_by_payment
    })

@app.get("/api/customers")
def get_customers(skip: int = 0, limit: int = 50, risk: str = None, sort_by: str = "Churn_Prob", sort_desc: bool = True):
    try:
        df = load_data()
        if df.empty:
            return {"data": [], "total": 0}
            
        if risk and risk != "All":
            df = df[df['Risk_Level'] == risk]

        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=not sort_desc)
        
        total = len(df)
        
        # Return limited fields
        required_cols = ['customerID', 'gender', 'tenure', 'Contract', 'PaymentMethod', 'MonthlyCharges', 'Churn', 'Churn_Prob', 'Risk_Level']
        # Check if columns exist to avoid KeyError
        found_cols = [c for c in required_cols if c in df.columns]
        df_mini = df[found_cols]
        
        paginated_data = df_mini.iloc[skip:skip+limit].to_dict(orient="records")
        
        for r in paginated_data:
            if 'Churn_Prob' in r:
                r['Churn_Prob'] = round(float(r['Churn_Prob']), 4)
            
        return to_jsonable({"data": paginated_data, "total": total})
    except Exception as e:
        print(f"Error in /api/customers: {str(e)}")
        return {"data": [], "total": 0, "error": str(e)}

@app.get("/api/metrics")
def get_model_metrics():
    try:
        path = BASE_DIR / "model_metrics.json"
        if path.exists():
            with path.open("r") as f:
                return json.load(f)
        return []
    except Exception:
        return []

@app.get("/api/ensemble-metrics")
def get_ensemble_metrics():
    try:
        path = BASE_DIR / "ensemble_metrics.json"
        if path.exists():
            with path.open("r") as f:
                return json.load(f)
        return []
    except Exception:
        return []

@app.get("/api/feature-importance")
def get_feature_importance():
    try:
        path = BASE_DIR / "feature_importance.json"
        if path.exists():
            with path.open("r") as f:
                return json.load(f)[:10]
        return []
    except Exception:
        return []

@app.get("/api/confusion-matrix")
def get_confusion_matrix():
    try:
        path = BASE_DIR / "dl_metrics.json"
        if path.exists():
            with path.open("r") as f:
                return json.load(f)
        return {"TN": 0, "FP": 0, "FN": 0, "TP": 0}
    except Exception:
        return {"TN": 0, "FP": 0, "FN": 0, "TP": 0}

@app.get("/api/feature-selection-metrics")
def get_feature_selection_metrics():
    try:
        path = BASE_DIR / "feature_selection_metrics.json"
        if path.exists():
            with path.open("r") as f:
                return json.load(f)
        return []
    except Exception:
        return []

class PredictRequest(BaseModel):
    tenure: float
    MonthlyCharges: float
    Contract: str
    PaymentMethod: str
    gender: str = "Male"
    Partner: str = "No"
    Dependents: str = "No"
    PhoneService: str = "Yes"
    MultipleLines: str = "No"
    InternetService: str = "Fiber optic"
    OnlineSecurity: str = "No"
    OnlineBackup: str = "No"
    DeviceProtection: str = "No"
    TechSupport: str = "No"
    StreamingTV: str = "No"
    StreamingMovies: str = "No"
    PaperlessBilling: str = "Yes"
    TotalCharges: float = 0.0

@app.post("/api/predict")
def predict_churn(req: PredictRequest):
    try:
        feature_names = joblib.load(BASE_DIR / 'models' / 'feature_names.pkl')
        label_encoders = joblib.load(BASE_DIR / 'models' / 'label_encoders.pkl')
        scaler = joblib.load(BASE_DIR / 'models' / 'scaler.pkl')
        
        # Load our deep learning model
        dl_model = tf.keras.models.load_model(BASE_DIR / 'models' / 'dl_churn_model.keras')
        
        input_data = pd.DataFrame([req.model_dump()])
        
        if input_data['TotalCharges'].iloc[0] == 0:
            input_data['TotalCharges'] = input_data['tenure'] * input_data['MonthlyCharges']
            
        for col, le in label_encoders.items():
            if col in input_data.columns:
                try:
                    val = input_data[col].iloc[0]
                    if val in le.classes_:
                        input_data[col] = le.transform(input_data[col])
                    else:
                        input_data[col] = 0
                except:
                    input_data[col] = 0

        for f in feature_names:
            if f not in input_data.columns:
                input_data[f] = 0
                
        input_data = input_data[feature_names]
        
        scaled_features = scaler.transform(input_data)
        prob = dl_model.predict(scaled_features, verbose=0)[0][0]
        
        prediction = "Yes" if prob > 0.5 else "No"
        risk = "High" if prob > 0.7 else "Medium" if prob > 0.3 else "Low"
        
        # Basic reasons
        reasons = []
        if req.tenure < 12: reasons.append(f"Low tenure ({req.tenure} months) significantly increases risk.")
        if req.Contract == "Month-to-month": reasons.append("Month-to-month contracts have the highest churn probability.")
        if req.MonthlyCharges > 70: reasons.append(f"High monthly charges (₹{req.MonthlyCharges}) may be driving dissatisfaction.")
        
        if not reasons: reasons.append("Customer profile looks relatively stable across standard KPIs.")
        
        return {
            "prediction": prediction,
            "probability": round(float(prob) * 100, 2),
            "risk_level": risk,
            "reasons": reasons
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
