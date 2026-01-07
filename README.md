# Handmade Shop App (PBL5)

## Overview

This project is a comprehensive online marketplace application designed specifically for handmade and artisan goods. It serves as a platform where artisans can create shops to showcase and sell their unique creations, while customers can browse, discover, and purchase one-of-a-kind items. The application focuses on providing a seamless user experience with modern design principles and robust functionality.

## Concept

The core concept is to bridge the gap between talented creators and those who appreciate handmade craftsmanship. The platform supports two primary user roles:

*   **Buyers:** Can browse products by category, search for specific items or shops, manage a shopping cart, save favorite items, and securely checkout.
*   **Sellers:** Can create and customize their own digital storefronts, manage product listings (including images and descriptions), and view their shop's performance.

The application is built with accessibility and global reach in mind, featuring full multi-language support for English, Romanian, and Russian.

## Features

*   **User Authentication & Security:**
    *   Secure Sign Up and Login.
    *   OAuth2 integration (Google Login).
    *   JWT-based session management.
    *   Role-based access control (Buyer/Seller).

*   **Shop Management:**
    *   Create and customize shops with logos and descriptions.
    *   Manage shop details and settings.
    *   View shop analytics (basic).

*   **Product Management:**
    *   Add, edit, and remove products.
    *   Upload product images (stored securely via Cloudflare R2/S3).
    *   Categorize items for better discoverability.

*   **Shopping Experience:**
    *   Advanced search and filtering for shops and items.
    *   Shopping Cart functionality.
    *   "Like" system for saving favorite items.
    *   Checkout process.

*   **Internationalization:**
    *   Real-time language switching.
    *   Support for English, Romanian, and Russian locales.

## Tech Stack

### Frontend
*   **Framework:** React (powered by Vite)
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI, Lucide React (Icons)
*   **State Management:** React Context API
*   **HTTP Client:** Axios
*   **Routing:** React Router DOM

### Backend
*   **Language:** Java 17
*   **Framework:** Spring Boot
*   **Security:** Spring Security (JWT, OAuth2)
*   **Database Access:** Spring Data JPA (Hibernate)
*   **Object Storage:** AWS SDK (configured for Cloudflare R2)
*   **Utilities:** Lombok, MapStruct

### Database & Infrastructure
*   **Database:** PostgreSQL
*   **Containerization:** Docker
*   **Build Tools:** Maven (Backend), npm (Frontend)

## Getting Started

### Prerequisites
*   Java 17 or higher 
*   Node.js (v18+ recommended)
*   PostgreSQL database
*   Maven

### Installation

#### Local build

1.  **Clone the repository**
    ```bash
    git clone https://github.com/TimurCravtov/CraftHub
    ```

2.  **Database Setup**
    *   Ensure PostgreSQL is running.
    *   Create a database named `handmadeshop`.
    *   Update `server/src/main/resources/application.properties` with your database credentials.

3.  **Backend Setup**
    ```bash
    cd server
    mvn spring-boot:run
    ```

4.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

5.  **Access the Application**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:8080`

#### Using Docker

```bash
docker compose up
```

