import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score, accuracy_score, precision_score, recall_score
import json

# 1. Load Data
dataset = pd.read_csv('../Churn2.csv')

# 2. Base Preprocessing
dataset['TotalCharges'] = pd.to_numeric(dataset['TotalCharges'], errors='coerce')
dataset['TotalCharges'] = dataset['TotalCharges'].fillna(dataset['TotalCharges'].median())

# Create Derived Feature
# Handle division by zero for tenure=0
dataset['AvgCharges'] = np.where(dataset['tenure'] > 0, dataset['TotalCharges'] / dataset['tenure'], dataset['MonthlyCharges'])

# Drop customer ID
if 'customerID' in dataset.columns:
    dataset = dataset.drop('customerID', axis=1)

categorical_cols = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines', 'InternetService', 
                    'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 
                    'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 'Churn']

for col in categorical_cols:
    le = LabelEncoder()
    dataset[col] = le.fit_transform(dataset[col])

X = dataset.drop('Churn', axis=1)
y = dataset['Churn']
all_features = X.columns.tolist()

# 3. Prevent Data Leakage Split & Scale
X_train_raw, X_test_raw, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_raw)
X_test_scaled = scaler.transform(X_test_raw)

# 4. Feature Importance Extraction using Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train_scaled, y_train)

importances = rf.feature_importances_
feature_imp_list = [{"Feature": feature, "Importance": float(imp)} for feature, imp in zip(all_features, importances)]
feature_imp_list = sorted(feature_imp_list, key=lambda x: x['Importance'], reverse=True)

# Save Feature Importances
with open('feature_importance.json', 'w') as f:
    json.dump(feature_imp_list, f, indent=4)

# 5. Filter Low Importance Features
# We will drop features with importance less than 0.02
threshold = 0.02
selected_features = [f['Feature'] for f in feature_imp_list if f['Importance'] >= threshold]
selected_indices = [all_features.index(f) for f in selected_features]

X_train_selected = X_train_scaled[:, selected_indices]
X_test_selected = X_test_scaled[:, selected_indices]

# 6. Train Models Before and After Selection
models = {
    "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
}

comparison_results = []

def eval_model(model, X_tr, X_te, y_tr, y_te, prefix):
    model.fit(X_tr, y_tr)
    preds = model.predict(X_te)
    return {
        f"{prefix} Accuracy": round(accuracy_score(y_te, preds), 4),
        f"{prefix} Precision": round(precision_score(y_te, preds), 4),
        f"{prefix} Recall": round(recall_score(y_te, preds), 4),
        f"{prefix} F1-score": round(f1_score(y_te, preds), 4)
    }

for name, model in models.items():
    # Before selection (All Features)
    res_before = eval_model(model, X_train_scaled, X_test_scaled, y_train, y_test, "Before")
    
    # After selection
    res_after = eval_model(model, X_train_selected, X_test_selected, y_train, y_test, "After")
    
    combined = {"Model": name}
    combined.update(res_before)
    combined.update(res_after)
    comparison_results.append(combined)

with open('feature_selection_metrics.json', 'w') as f:
    json.dump(comparison_results, f, indent=4)

print("Feature Expansion & Selection Completed Successfully.")

