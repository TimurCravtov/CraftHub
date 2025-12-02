# CraftHub - Handmade Shop Marketplace

CraftHub is a full-stack web application designed to connect artisans with buyers. It allows users to open shops, list handmade products, and enables customers to browse, search, and purchase unique items.

## 🚀 Components

The project is divided into two main parts:

### 1. Client (`/client`)
The frontend application built with **React** and **Vite**.
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Features**:
  - Responsive UI
  - Multi-language support (i18n)
  - User Dashboard (Buyer/Seller)
  - Product Search & Filtering
  - Shopping Cart & Checkout flow

### 2. Server (`/server`)
The backend REST API built with **Java Spring Boot**.
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT, OAuth2 (Google), 2FA (TOTP)
- **Storage**: Cloudflare R2 for image storage
- **Features**:
  - Robust Authentication & Authorization
  - Shop & Product Management
  - Order Processing
  - User Profile Management

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Java 17+, Spring Boot 3, Hibernate/JPA
- **Database**: PostgreSQL
- **DevOps**: Docker, Docker Compose

## 🏃‍♂️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev)
- Java 17+ (for local backend dev)

### Run with Docker
```bash
docker-compose up --build
```

### Manual Setup
1. **Database**: Ensure PostgreSQL is running.
2. **Server**:
   \`\`\`bash
   cd server
   ./mvnw spring-boot:run
   \`\`\`
3. **Client**:
   \`\`\`bash
   cd client
   npm install
   npm run dev
   \`\`\`
.