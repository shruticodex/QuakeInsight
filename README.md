# 🌍 QuakeInsight  
### Real-Time Earthquake Monitoring & Analysis Using Machine Learning

QuakeInsight is a web-based system designed to **monitor, analyze, and visualize earthquake data in real time** using machine learning and interactive data visualization techniques.  
The project integrates multiple seismic data sources and provides tools for **EDA, prediction, clustering, and declustering of earthquakes** through an intuitive user interface.

---

## 🎯 Objectives
- Real-time collection and analysis of earthquake data
- Interactive visualization of seismic activity
- Application of machine learning models for magnitude prediction
- Clustering and declustering of earthquake events
- Provide a user-friendly platform for research and awareness

---

## 🧠 Features

### 📡 Data Sources
- **USGS (API-based real-time data)**
- **NSC India (CSV upload support)**
- (Planned) **SCEDC & IRIS integration**

---

### 📊 Exploratory Data Analysis (EDA)
- Longitude vs Latitude (Interactive Map)
- Mainshock highlighting
- Cumulative plots
- Lambda plot
- Gutenberg–Richter Law
- Omori Law
- Spatio-temporal visualizations
- Depth & magnitude-based plots

---

### 🤖 Earthquake Magnitude Prediction
- Linear Regression  
- Support Vector Machine (SVM)  
- Naïve Bayes  
- Random Forest  
- LSTM (Long Short-Term Memory)

---

### 🧩 Clustering Algorithms
- DBSCAN  
- K-Means  
- Fuzzy C-Means  

---

### 🔎 Declustering Algorithms
- DBSCAN-based Declustering  
- Nearest Neighbor Distance (NND)  
- Gruenthal Algorithm  
- Reasenberg Algorithm  

---

### 🗺️ Interactive Visualization
- Leaflet.js / Plotly maps
- Dynamic charts and graphs
- Downloadable analysis results

---

## 🛠️ Tech Stack

### Frontend
- **Next.js (App Router)**
- React
- TypeScript
- Tailwind CSS
- Plotly / Leaflet.js

### Backend
- Next.js API Routes
- REST APIs (USGS)
- CSV-based processing (NSC)

### Machine Learning
- Python (data analysis & ML models)
- Scikit-learn
- TensorFlow / Keras (LSTM)

---

## 📂 Project Structure
QuakeInsight/

├── app/

│ ├── page.tsx # Homepage

│ ├── layout.tsx # Global layout

│ ├── recent-earthquakes/ # Recent earthquakes page

│ ├── research/ # Analysis & ML features

│ ├── contact/ # Contact page

│ ├── definitions/ # Earthquake glossary

│ ├── api/

│ │ └── analyze/route.ts # Backend data processing

│ └── components/ # Reusable UI components

├── public/

├── styles/

├── .gitignore

├── package.json

└── README.md


---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or above)
- npm / yarn
- Python (for ML scripts)

### Steps
```bash
git clone https://github.com/<your-username>/QuakeInsight.git
cd QuakeInsight
npm install
npm run dev
```
Open:
👉 http://localhost:3000

## 🔐 Environment Variables

Create a .env.local file in the root directory:

NEXT_PUBLIC_API_BASE_URL=your_api_url_here


⚠️ .env files are ignored for security reasons.


## 📈 Future Enhancements

- Live seismic alert notifications

- More regional data sources

- Improved LSTM accuracy

- Mobile responsiveness optimization

- User authentication for researchers

## 🎓 Academic Context

This project is developed as part of a B.Tech (CSE) Final Year Project, focusing on:

- Real-time data analytics

- Machine learning applications

- Disaster management & awareness

## 👩‍💻 Author

Shruti
B.Tech – Computer Science & Engineering

## 📜 License

This project is for academic and research purposes.
