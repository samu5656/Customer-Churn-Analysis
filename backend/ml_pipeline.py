import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

# Ensure the models directory exists
os.makedirs('models', exist_ok=True)

print("Loading dataset...")
dataset = pd.read_csv('../Churn2.csv')

# Handle Missing and Incorrect Values
dataset['TotalCharges'] = pd.to_numeric(dataset['TotalCharges'], errors='coerce')
dataset['TotalCharges'].fillna(dataset['TotalCharges'].median(), inplace=True)

# Separate features into categorical and numerical
categorical_cols = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines', 'InternetService', 
                    'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 
                    'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 'Churn']

print("Encoding categorical variables...")
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    dataset[col] = le.fit_transform(dataset[col])
    label_encoders[col] = le

# Prepare features and target
X = dataset.drop(['customerID', 'Churn'], axis=1)
y = dataset['Churn']

# Keep list of features used to align input data later
feature_names = X.columns.tolist()
joblib.dump(feature_names, 'models/feature_names.pkl')
joblib.dump(label_encoders, 'models/label_encoders.pkl')

print("Splitting and Scaling data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

joblib.dump(scaler, 'models/scaler.pkl')

print("Training Random Forest Classifier (Baseline)...")
clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
clf.fit(X_train_scaled, y_train)
joblib.dump(clf, 'models/churn_model.pkl')

print("Training Enhanced Deep Learning Model (Keras)...")
tf.random.set_seed(42)
#core part - model architecture
dl_model = Sequential([
#64 neurons , relu : f(x)=max(0,x)
# Converts negative values → 0
# Keeps positive values

# Why ReLU?

# Fast
# Avoids vanishing gradient problem
# Helps deep networks learn better
    Dense(64, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    #prevents overfitting
    Dropout(0.3),
    #second hidden layer - reduces complexity
    Dense(32, activation='relu'),
    Dropout(0.2),
    #third hidden layer - further reduces complexity
    Dense(16, activation='relu'),
    #output layer - sigmoid for binary classification
    Dense(1, activation='sigmoid')
])
#Loss Function: Binary Crossentropy
#L=−[ylog(p)+(1−y)log(1−p)] - prediction wrong - high loss ; correct - low loss
dl_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Callbacks for better training - smart training
callbacks = [
    #EarlyStopping: stops training when validation loss stops improving
    tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
    #ReduceLROnPlateau: reduces learning rate when validation loss stops improving
    tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3)
]

# Train the Deep Learning model
dl_model.fit(X_train_scaled, y_train, epochs=50, batch_size=32, validation_split=0.2, callbacks=callbacks, verbose=0)
dl_model.save('models/dl_churn_model.keras')

# Performance Evaluation
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import json

y_pred_prob = dl_model.predict(X_test_scaled, verbose=0).flatten()
#<0.5 -> no churn else churn
y_pred = (y_pred_prob > 0.5).astype(int)

# Dynamic Confusion Matrix
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
dl_metrics = {
    "TN": int(tn),
    "FP": int(fp),
    "FN": int(fn),
    "TP": int(tp)
}
with open('dl_metrics.json', 'w') as f:
    json.dump(dl_metrics, f)

# DL Model Comparison Metrics
dl_ann_metrics = {
    "Model": "Deep Learning (ANN)",
    "Accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
    "Precision": round(float(precision_score(y_test, y_pred)), 4),
    "Recall": round(float(recall_score(y_test, y_pred)), 4),
    "F1-score": round(float(f1_score(y_test, y_pred)), 4)
}

# Update model_metrics.json (Add ANN to the list)
try:
    with open('model_metrics.json', 'r') as f:
        existing_metrics = json.load(f)
except:
    existing_metrics = []

# Replace or add ANN metrics
updated_metrics = [m for m in existing_metrics if m['Model'] != 'Deep Learning (ANN)']
updated_metrics.append(dl_ann_metrics)

with open('model_metrics.json', 'w') as f:
    json.dump(updated_metrics, f)

print(f"Deep Learning ANN Accuracy: {dl_ann_metrics['Accuracy']}")

print("Generating enhanced customer dataset with predictions and risk levels...")
# Using the full dataset for dashboard
X_scaled_full = scaler.transform(X)
probabilities = dl_model.predict(X_scaled_full, verbose=0).flatten()

dashboard_data = pd.read_csv('../Churn2.csv')
dashboard_data['TotalCharges'] = pd.to_numeric(dashboard_data['TotalCharges'], errors='coerce')
dashboard_data['TotalCharges'].fillna(dashboard_data['TotalCharges'].median(), inplace=True)
dashboard_data['Churn_Prob'] = probabilities
dashboard_data['Risk_Level'] = pd.cut(dashboard_data['Churn_Prob'], bins=[-np.inf, 0.3, 0.7, np.inf], labels=['Low', 'Medium', 'High'])
dashboard_data.to_csv('dashboard_data.csv', index=False)

print("ML Pipeline completed successfully.")

# Automatically run supplementary evaluation scripts to sync all artifacts
print("Syncing model metrics and ensemble analysis...")
try:
    import subprocess
    subprocess.run(["python", "evaluate_models.py"], check=True)
    subprocess.run(["python", "evaluate_ensembles.py"], check=True)
    print("All metric artifacts successfully synchronized.")
except Exception as e:
    print(f"Warning: Failed to sync some metrics: {str(e)}")

