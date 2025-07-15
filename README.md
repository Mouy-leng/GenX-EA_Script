# GenX-EA Script: AI-Powered Trading Bot

This project is a comprehensive framework for a trading bot that leverages machine learning to predict market movements and execute trades on the Bybit cryptocurrency exchange. It is containerized using Docker for easy setup and deployment.

## ✨ Features

- **AI-Powered Predictions**: Uses a pre-trained `scikit-learn` model to predict market trends.
- **Pattern Recognition**: Detects classic candlestick patterns from market data.
- **Signal Analysis**: Combines AI predictions and technical patterns to generate trading signals.
- **Bybit Integration**: Connects directly to the Bybit V5 API for real-time data and order execution.
- **Containerized**: Fully containerized with Docker and Docker Compose for a consistent development and production environment.
- **Full-Stack Ready**: Includes services for a frontend (`client`), backend API (`server`), and the core Python trading logic (`python`).

## 🛠️ Tech Stack

- **Python Service**:
  - **Python 3.10+**
  - **Pandas**: For data manipulation and analysis.
  - **Scikit-learn**: For machine learning predictions.
  - **Pybit**: For Bybit API communication.
  - **Docker**: For containerization.
- **Server**: Node.js (Setup for a backend API, e.g., Express).
- **Client**: Node.js (Setup for a frontend framework, e.g., React, Vue).

## 📂 Project Structure

```
GenX-EA_Script/
├── ai_models/            # Stores trained machine learning models
├── api/                  # FastAPI server logic
├── client/               # Frontend application code
├── core/                 # Core Python logic (execution, patterns, strategies)
├── data/                 # Sample or historical data
├── server/               # Backend server code (Node.js)
├── services/             # Service-specific code (e.g., Python main script)
├── .env                  # (Local) Environment variables (ignored by Git)
├── .env.example          # Example environment variables
├── docker-compose.yml    # Defines and runs the multi-container application
├── Dockerfile            # Builds the Docker images for all services
└── README.md             # This file
```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GenX-EA_Script.git
cd GenX-EA_Script
```

### 2. Configure Environment Variables

The Python service requires Bybit API keys to function.

1.  Copy the example `.env.example` file to a new `.env` file:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and add your Bybit API Key and Secret. You can generate these from your Bybit API Management page.

    ```ini
    # .env
    BYBIT_API_KEY="YOUR_API_KEY_HERE"
    BYBIT_API_SECRET="YOUR_SECRET_KEY_HERE"
    ```

### 3. Build and Run the Application

Use Docker Compose to build the images and start all the services.

```bash
# Build the images for all services
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

### 4. Accessing the Services

- **Python Service**: The trading logic runs in the background. You can view its logs with `docker-compose logs -f python`.
- **Backend Server**: Accessible at `http://localhost:3000`.
- **API Server**: Accessible at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.
- **Frontend Client**: Accessible at `http://localhost:5173`.