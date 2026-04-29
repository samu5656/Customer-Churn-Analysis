import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import json

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

# 3. Splitting and Scaling
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. Initialize Models
# We pick a base estimator Decision Tree to demonstrate how Ensemble techniques fix its overfitting.
models = {
    "Baseline: Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
    "Baseline: Decision Tree": DecisionTreeClassifier(random_state=42),
    "Ensemble (Bagging): Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "Ensemble (Boosting): Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
}

results = []

for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    
    # Predict on Train to check for overfitting
    y_train_pred = model.predict(X_train_scaled)
    train_acc = accuracy_score(y_train, y_train_pred)
    train_f1 = f1_score(y_train, y_train_pred)

    # Predict on Test
    y_pred = model.predict(X_test_scaled)
    test_acc = accuracy_score(y_test, y_pred)
    test_prec = precision_score(y_test, y_pred)
    test_rec = recall_score(y_test, y_pred)
    test_f1 = f1_score(y_test, y_pred)
    
    results.append({
        "Model": name,
        "Train Acc": round(train_acc, 4),
        "Test Acc": round(test_acc, 4),
        "Test Precision": round(test_prec, 4),
        "Test Recall": round(test_rec, 4),
        "Train F1": round(train_f1, 4),
        "Test F1": round(test_f1, 4)
    })

with open("ensemble_metrics.json", "w") as f:
    json.dump(results, f)

print("Ensemble evaluation complete.")
