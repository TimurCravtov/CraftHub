<p align="center">
  <img src="client/public/assets/logo.png" width="100" style="vertical-align:middle" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <span style="font-size:30px; font-weight:bold; vertical-align:middle"> CraftHub </span>
</p>

## Overview

This project is a comprehensive online marketplace application designed specifically for handmade and artisan goods. It serves as a platform where artisans can create shops to showcase and sell their unique creations, while customers can browse, discover, and purchase one-of-a-kind items. The application focuses on providing a seamless user experience with modern design principles and robust functionality.

## Features

*   **User Authentication & Security:** Secure Sign Up/Login, OAuth2 (Google), JWT, RBAC.
*   **Shop Management:** Create shops, manage products, view analytics.
*   **Product Management:** CRUD operations, image hosting (Cloudflare R2/S3).
*   **Shopping Experience:** Search, filter, cart, favorites, checkout.
*   **Internationalization:** English, Romanian, Russian.

## Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Radix UI.
*   **Backend:** Java 17, Spring Boot 3, Spring Security, Hibernate.
*   **Database:** PostgreSQL.
*   **DevOps:** Docker, Docker Compose.
*   **Storage:** Cloudflare R2 (S3 Compatible).

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   [Python 3.x](https://www.python.org/) (for helper scripts)
*   **Optional (for local dev without Docker):**
    *   Java JDK 17+
    *   Node.js 18+ (LTS) & npm
    *   PostgreSQL 15+

### 1. Environment Setup

The project relies on a single root \.env\ file to configure both the Backend (Spring Boot) and Frontend (React/Vite) containers.

1.  **Duplicate the example file:**
    ```ash
    cp .env.example .env
    ```
    *On Windows PowerShell:*
    ```powershell
    Copy-Item .env.example .env
    ```

2.  **Configure Credentials:**
    Open the \.env\ file and fill in the required values.

    *   **Database:** Defaults (\localhost\, \postgres\, \qwerty\) work out-of-the-box with Docker.
    *   **Security:** Generate a secure random string for \JWT_SECRET\ (min 32 chars) and \TFA_ENCRYPTION_KEY\.
    *   **Cloud Storage:** You need a Cloudflare R2 bucket (or AWS S3). Fill in \R2_ACCESS_KEY\, \R2_SECRET_KEY\, \R2_BUCKET\, and \R2_ENDPOINT\.
    *   **OAuth2:** Obtain Google Client ID and Secret from the [Google Cloud Console](https://console.cloud.google.com/) and update \GOOGLE_CLIENT_ID\, \GOOGLE_CLIENT_SECRET\.

### 2. Loading Environment Variables (Local Dev)

If you are running scripts locally (like database migrations or python utilities) and need the environment variables loaded into your shell session, we provide a helper script.

**Usage:**
This Python script reads the \.env\ file and injects keys into the process environment.
```bash
python scripts/load_dotenv.py
```

### 3. Running with Docker (Recommended)

This is the easiest way to spin up the entire application (Database, Backend, Frontend).

1.  **Build and Start:**
    ```bash
    docker compose up --build
    ```
    *Add \-d\ to run in detached mode (background).*

2.  **Access the Application:**
    *   **Frontend:** [http://localhost:5173](http://localhost:5173)
    *   **Backend API:** [http://localhost:8080](http://localhost:8080)
    *   **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) (if enabled)

3.  **Stop Containers:**
    ```bash
    docker compose down
    ```

### 4. Running Locally (Development Mode)

If you prefer to run services individually on your machine:

#### Backend (Spring Boot)
1.  Make sure PostgreSQL is running and matches the credentials in \.env\.
2.  Navigate to the server directory:
    ```bash
    cd server
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(Or open the project in IntelliJ IDEA and run \ServerApplication\)*

#### Frontend (React)
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```

## 🧪 Running Tests

To run the backend unit and integration tests:

```bash
cd server
./mvnw test
```
