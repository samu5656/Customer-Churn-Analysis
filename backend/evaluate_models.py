import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import json
import joblib
import tensorflow as tf
import os

# 1. Load Dataset
dataset = pd.read_csv('../Churn2.csv')

# 2. Preprocess
dataset['TotalCharges'] = pd.to_numeric(dataset['TotalCharges'], errors='coerce')
dataset['TotalCharges'].fillna(dataset['TotalCharges'].median(), inplace=True)

categorical_cols = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines', 'InternetService', 
                    'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 
                    'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 'Churn']

for col in categorical_cols:
    le = LabelEncoder()
    dataset[col] = le.fit_transform(dataset[col])

X = dataset.drop(['customerID', 'Churn'], axis=1)
y = dataset['Churn']

# 3. Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. Initialize Models
models = {
    "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5)
}

results = []

# 5. Train and Evaluate Sklearn Models
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    
    results.append({
        "Model": name,
        "Accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "Precision": round(float(precision_score(y_test, y_pred)), 4),
        "Recall": round(float(recall_score(y_test, y_pred)), 4),
        "F1-score": round(float(f1_score(y_test, y_pred)), 4)
    })

# 6. Evaluate Deep Learning (ANN) Model if it exists
dl_model_path = 'models/dl_churn_model.keras'
if os.path.exists(dl_model_path):
    print("Evaluating Deep Learning Model...")
    dl_model = tf.keras.models.load_model(dl_model_path)
    y_pred_prob = dl_model.predict(X_test_scaled, verbose=0).flatten()
    y_pred = (y_pred_prob > 0.5).astype(int)
    
    results.append({
        "Model": "Deep Learning (ANN)",
        "Accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "Precision": round(float(precision_score(y_test, y_pred)), 4),
        "Recall": round(float(recall_score(y_test, y_pred)), 4),
        "F1-score": round(float(f1_score(y_test, y_pred)), 4)
    })

# Output as JSON
with open("model_metrics.json", "w") as f:
    json.dump(results, f)

print("Evaluation complete.")
