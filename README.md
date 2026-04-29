# Customer Churn Prediction and Retention Intelligence

## Problem Statement

Businesses lose revenue when customers silently move toward cancellation before support, sales, or retention teams can intervene. Traditional reporting usually shows churn after it has already happened, which makes the business reactive: teams know how many customers left, but not which active customers are at risk, why they are at risk, or how much revenue is exposed.

This project solves that problem by using machine learning to predict customer churn probability, classify customers into risk bands, estimate revenue loss, and present the results through an interactive business dashboard. It helps decision makers move from post-churn reporting to proactive retention action.

## Project Overview

Churn X is a full-stack customer churn analytics application built with:

- A machine learning backend for training, evaluation, prediction, feature importance, and dashboard data generation.
- A FastAPI service that exposes customer, metric, model insight, and prediction endpoints.
- A React dashboard that turns ML outputs into executive KPIs, charts, customer risk views, model insights, and real-time prediction workflows.

The dataset used in this project is `Churn2.csv`, which contains telecom-style customer records such as tenure, contract type, billing method, monthly charges, services used, and churn status.

## Why Customer Churn Prediction Matters

Customer acquisition is usually more expensive than customer retention. When churn is not detected early, businesses lose recurring revenue, lifetime value, and opportunities to repair customer experience issues. A churn prediction system helps teams:

- Identify high-risk customers before they leave.
- Prioritize retention campaigns based on probability and revenue impact.
- Understand churn drivers such as contract type, tenure, payment method, service usage, and charges.
- Reduce wasted effort by focusing outreach on customers most likely to churn.
- Convert raw customer data into operational decisions for support, marketing, and leadership teams.

## Core Functionalities

### 1. Executive Churn Dashboard

The dashboard summarizes the health of the customer base using key business metrics:

- Total customers.
- Overall churn rate.
- Total revenue lost from churned customers.
- Expected revenue loss from active customers based on churn probability.
- Churn distribution.
- Active customer risk distribution.
- Revenue loss by payment method.

This gives leadership a quick view of churn severity and the financial impact of customer attrition.

### 2. Customer Risk Database

The customer view lists individual customers with:

- Customer ID.
- Demographic and billing attributes.
- Monthly charges.
- Actual churn status.
- Predicted churn probability.
- Risk level: Low, Medium, or High.

Users can filter by risk level, sort important columns, paginate customer records, and export the visible customer list as CSV. This makes the model output actionable for retention teams.

### 3. Real-Time Churn Prediction

The prediction module allows an admin user to run what-if analysis for a customer profile. Inputs include:

- Tenure.
- Monthly charges.
- Contract type.
- Payment method.
- Gender.
- Internet service.
- Security and support add-ons.
- Partner/dependent status.

The backend returns:

- Churn prediction.
- Churn probability.
- Risk level.
- Human-readable reasons explaining the risk.

This is useful for testing scenarios such as how contract changes, service add-ons, or billing patterns may affect churn likelihood.

### 4. Model Evaluation and Insights

The project compares multiple algorithms:

- Logistic Regression.
- Decision Tree.
- Random Forest.
- K-Nearest Neighbors.
- Gradient Boosting.
- Deep Learning Artificial Neural Network.

The UI displays accuracy, precision, recall, F1-score, train/test comparisons, overfitting analysis, and confusion matrix results. This makes the system more transparent and helps users understand whether the model is reliable enough for decision support.

### 5. Feature Importance and Feature Selection

The feature insights section identifies the most influential churn drivers using Random Forest feature importance. It highlights factors such as:

- Total charges.
- Average charges.
- Monthly charges.
- Tenure.
- Contract type.
- Payment method.
- Technical support.
- Online security.

The project also compares model performance before and after removing low-importance features, showing how feature selection affects accuracy and efficiency.

## How It Solves Real-World Problems

This project turns customer churn from a historical metric into a forward-looking operational signal.

Instead of only asking, "How many customers left?", the system helps answer:

- Which active customers are most likely to churn?
- How much revenue is currently at risk?
- What factors are driving churn?
- Which customer groups should retention teams contact first?
- Which model performs best for the available data?
- How would changes in customer profile affect churn probability?

For a telecom, subscription, SaaS, banking, insurance, or membership-based business, this workflow can support targeted retention campaigns, loyalty offers, proactive support calls, pricing review, and product experience improvements.

## Use Cases

- Customer success teams can find high-risk customers and intervene before cancellation.
- Marketing teams can design retention offers for specific churn drivers.
- Finance teams can estimate expected revenue loss from active accounts.
- Executives can monitor churn rate and revenue exposure from one dashboard.
- Data science teams can compare model performance and explain model behavior.
- Support teams can understand whether billing, tenure, contract type, or missing add-on services are increasing churn risk.

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Recharts
- Lucide React icons
- Tailwind CSS

### Backend

- FastAPI
- Pandas
- NumPy
- Scikit-learn
- TensorFlow / Keras
- Joblib
- Uvicorn

### Machine Learning

- Label encoding for categorical variables.
- Standard scaling for numerical model input.
- Train/test split evaluation.
- Random Forest baseline model.
- Deep Learning ANN production prediction model.
- Confusion matrix and classification metrics.
- Feature importance analysis.
- Feature selection comparison.
- Ensemble model comparison.

## Project Structure

```text
Customer churn/
+-- Churn2.csv
+-- README.md
+-- backend/
|   +-- app.py
|   +-- ml_pipeline.py
|   +-- evaluate_models.py
|   +-- evaluate_ensembles.py
|   +-- feature_engineering.py
|   +-- dashboard_data.csv
|   +-- model_metrics.json
|   +-- ensemble_metrics.json
|   +-- dl_metrics.json
|   +-- feature_importance.json
|   +-- feature_selection_metrics.json
+-- frontend/
    +-- package.json
    +-- index.html
    +-- src/
        +-- App.jsx
        +-- main.jsx
        +-- components/
            +-- Dashboard.jsx
            +-- Customers.jsx
            +-- FeatureInsights.jsx
            +-- Login.jsx
            +-- ModelInsights.jsx
            +-- Prediction.jsx
```

## Getting Started

### 1. Backend Setup

From the project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pandas numpy scikit-learn tensorflow joblib
```

Run the ML pipeline to train models and generate dashboard artifacts:

```bash
python ml_pipeline.py
```

Start the FastAPI server:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Backend API will run at:

```text
http://127.0.0.1:8000
```

### 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://127.0.0.1:5173
```

## Login Credentials

The app includes simple demo authentication:

| Role | Username | Password | Access |
| --- | --- | --- | --- |
| Admin | `admin` | `admin123` | Dashboard, customers, model insights, feature insights, prediction |
| Analyst | `analyst` | `analyst123` | Dashboard, customers, model insights, feature insights |

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/login` | Demo login for admin and analyst users |
| `GET` | `/api/dashboard/metrics` | Returns total customers, churn rate, revenue lost, and expected loss |
| `GET` | `/api/dashboard/charts` | Returns chart-ready churn, risk, and payment loss data |
| `GET` | `/api/customers` | Returns paginated and sortable customer risk records |
| `GET` | `/api/metrics` | Returns model comparison metrics |
| `GET` | `/api/ensemble-metrics` | Returns train/test ensemble metrics |
| `GET` | `/api/feature-importance` | Returns top churn-driving features |
| `GET` | `/api/confusion-matrix` | Returns ANN confusion matrix values |
| `GET` | `/api/feature-selection-metrics` | Returns before/after feature selection metrics |
| `POST` | `/api/predict` | Predicts churn for a custom customer profile |

## Model Performance Snapshot

Current generated metrics show the strongest models reaching roughly 81% test accuracy. Logistic Regression and the Deep Learning ANN perform closely, while the Decision Tree shows clear overfitting in train/test comparison. The dashboard exposes these results so users can evaluate accuracy, precision, recall, F1-score, and generalization behavior before trusting predictions.

## Business Impact

The main value of this project is not just predicting churn. Its value is translating prediction into action:

- Risk scores help decide who needs attention first.
- Revenue estimates help quantify business urgency.
- Feature insights explain why customers may leave.
- Model insights support transparent, evidence-based adoption.
- What-if prediction helps test retention scenarios before applying them in the real world.

By combining machine learning, explainability, and a usable dashboard, this project demonstrates how data science can directly support retention strategy and revenue protection.

## Future Enhancements

- Add secure production authentication.
- Store customer and prediction data in a database.
- Add campaign tracking for retention actions.
- Add SHAP-based explainability for individual predictions.
- Add model retraining schedules.
- Add deployment configuration using Docker.
- Add automated backend and frontend tests.

## Screenshots

### Executive Dashboard

![Executive Dashboard](docs/screenshots/dashboard.png)

### Customer Database

![Customer Database](docs/screenshots/customers.png)

### Model Insights

![Model Insights](docs/screenshots/model-insights.png)

### Feature Insights

![Feature Insights](docs/screenshots/feature-insights.png)

### Predictive Engine

![Predictive Engine](docs/screenshots/prediction.png)
