# Vendex – AI-Powered B2B Supply Chain Platform

Vendex is an intelligent B2B platform that connects store owners, consumers, and manufacturers.
It enables smart inventory management, demand forecasting, intent-based shopping, and real-time stock updates using AI.

## 🚀 Features

### 👤 Consumer

* Check real-time product availability
* Intent-based shopping (type what you need, get all required products)

### 🏪 Store Owners

* Demand forecasting using AI
* Optimal reorder quantity suggestions
* Real-time stock tracking with auto-updates after sales/purchases
* Staff management (roles, shifts, responsibilities)
* Connect with manufacturers and get recommendations
* Downloadable receipts for transactions

### 📊 Analytics

* Visual dashboards & reports (Power BI integration)

---

## 🛠️ Tech Stack

* Backend: **Python (FastAPI)**
* ML & Data: **Pandas, NumPy**
* Database: **MySQL**
* Frontend: AI-generated / Web UI
* Analytics: **Power BI**

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
Vendex/
 └── python/
     ├── main.py        # FastAPI entry point
     ├── routers.py     # API routes
     ├── demand.py      # Demand forecasting logic
     └── ...
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
