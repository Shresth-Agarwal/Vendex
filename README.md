# Vendex – AI-Powered B2B Supply Chain Platform

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Python](https://img.shields.io/badge/Python-3.10-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![AI](https://img.shields.io/badge/AI-Driven-purple)
![PowerBI](https://img.shields.io/badge/Analytics-PowerBI-yellow)


Vendex is an AI-powered B2B supply chain optimization platform that connects store owners, consumers, and manufacturers into a unified smart ecosystem.  
It enables real-time inventory tracking, demand forecasting, intelligent reorder recommendations, and intent-based product discovery using data-driven AI models.


## 🚀 Core Capabilities

### 👤 Consumer Experience
- Real-time product availability tracking
- Intent-based shopping (natural language input → structured product suggestions)
- Smart product recommendations

### 🏪 Store Owners

- AI-based demand forecasting using historical sales data
- Optimal reorder quantity recommendations
- Real-time inventory auto-update after transactions
- Staff management (roles, responsibilities, tracking)
- Direct manufacturer connectivity
- Automated receipt generation & downloadable invoices

### 📊 Analytics & Insights

- Power BI dashboard integration
- Sales trend visualization
- Inventory turnover insights
- Demand prediction reports
- Business performance metrics

---

## 🏗 System Architecture
Frontend (Consumer / Store Owner Interface)
↓
FastAPI Backend (Business Logic + ML Models)
↓
MySQL Database (Inventory & Orders)
↓
Power BI (Analytics Layer)

---

## 🛠️ Tech Stack

### Backend
- FastAPI (Python)
- RESTful APIs
- Uvicorn Server

### AI / ML Layer
- Google Gemini API (LLM integration)
- Pandas
- NumPy
- Scikit-learn
- Time-series forecasting techniques

### Database
- MySQL
- Relational schema with inventory & orders

### Analytics
- Microsoft Power BI 

### Frontend
- Web UI (AI-generated)

---

## 🏗 System Architecture

Consumer / Store Owner (Frontend)
⬇
FastAPI Backend (Business Logic + ML Models)
⬇
MySQL Database
⬇
Power BI (Analytics Layer)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Shresth-Agarwal/Vendex.git
cd Vendex/python
```

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
```

Activate it:

* Windows:

```bash
venv\Scripts\activate
```

* macOS/Linux:

```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` is not present, install manually:

```bash
pip install fastapi uvicorn pandas numpy mysql-connector-python scikit-learn
```

> This fixes errors like:

```text
ModuleNotFoundError: No module named 'pandas'
```

### 4️⃣ Run the Backend

```bash
uvicorn main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

API Docs:

```
http://127.0.0.1:8000/docs
```

---

## 📂 Project Structure

```
## 📂 Project Structure

Vendex/
│
├── frontend/                 # Frontend application (Next.js / React)
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── python/                   # FastAPI Backend
│   ├── __pycache__/
│   ├── pydantic_classes/     # Request/Response schemas
│   ├── venv/                 # Virtual environment
│   ├── assign.py             # Assignment logic
│   ├── decision.py           # Decision-making logic
│   ├── demand.py             # Demand forecasting (ML)
│   ├── intent.py             # Intent processing (Gemini integration)
│   ├── main.py               # FastAPI entry point
│   ├── receipt.py            # Receipt generation logic
│   ├── recommender.py        # Recommendation engine
│   ├── routers.py            # API route definitions
│   └── requirements.txt
│
├── Spring_Boot/              # (Optional / Legacy backend module)
│
├── .gitignore
├── README.md
└── requirements.txt

```

---

## 🧠 AI Capabilities

* Time-series based demand forecasting
* Intelligent reorder suggestions
* Intent understanding for consumers
* Automated business insights

---

## 👥 Vision

Vendex aims to modernize small and medium businesses by:

* Reducing stock shortages
* Preventing over-ordering
* Connecting owners directly with manufacturers
* Providing AI-driven business intelligence
