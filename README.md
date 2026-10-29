# 🍽️ TryRestro — Restaurant POS & Management System

### A Full-Stack, Multi-Tenant Restaurant Management SaaS Platform

TryRestro is a full-stack Restaurant Point-of-Sale (POS) application built using the MERN stack. It helps restaurants manage orders, dine-in tables, takeaway orders, menus, inventory, billing, staff, subscriptions, and business analytics through a centralized platform.

## 🚀 Live Demo

### 👉 [Visit TryRestro — Live Application](https://tryrestro.vercel.app/)

**Live Website:** https://tryrestro.vercel.app/

Explore the deployed application and experience its available restaurant management workflows.

> **Note:** Some features require authentication, an active restaurant subscription, or compatible hardware. Availability also depends on the deployed backend and database services.

---

## 📌 Project Overview

TryRestro is designed as a multi-tenant SaaS platform where multiple restaurants can operate independently.

Each restaurant has its own workspace with restaurant-specific menus, tables, orders, inventory, staff, and subscription information.

The platform supports four primary roles:

- **Super Admin:** Manages the overall platform, restaurants, users, subscriptions, and notifications.
- **Admin:** Manages an individual restaurant, its menu, staff, tables, inventory, and subscription.
- **Waiter:** Creates orders, manages tables, and accesses the menu.
- **Kitchen:** Uses a dedicated interface to manage kitchen order tickets and permitted stock operations.

### 🎯 Project Objectives

- Simplify restaurant order management and billing.
- Support multiple restaurants through a shared SaaS platform.
- Maintain restaurant-level data isolation.
- Track menu items and inventory.
- Improve coordination between waiters and kitchen staff.
- Support thermal receipt printing.
- Provide business analytics and Excel exports.
- Manage subscriptions through a Super Admin dashboard.
- Apply authentication, authorization, and server-side validation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Frontend Tooling | Vite |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| Data Fetching & Caching | TanStack React Query |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Charts | Recharts |
| Excel Export | SheetJS (`xlsx`) |
| Notifications | Notistack, Web Audio API |
| Receipt Printing | WebUSB, ESC/POS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, httpOnly cookies |
| Password Security | bcrypt |
| Email Verification | Email OTP |
| Transactional Email | Brevo HTTP API |
| Frontend Hosting | Vercel |

---

## ☁️ Deployment Architecture

TryRestro uses a separately deployed frontend and backend architecture.

| Component | Technology / Platform |
|---|---|
| Frontend | React + Vite |
| Frontend Hosting | Vercel |
| Backend API | Node.js + Express.js |
| Backend Hosting | Deployed service — provider not specified here |
| Database | MongoDB |
| Email Service | Brevo HTTP API |
| Live Application | [tryrestro.vercel.app](https://tryrestro.vercel.app/) |

### Architecture Overview

```text
                    ┌────────────────────────┐
                    │      User Browser      │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Vercel Frontend      │
                    │                        │
                    │ React + Vite           │
                    │ Redux Toolkit          │
                    │ TanStack React Query   │
                    └────────────┬───────────┘
                                 │
                                 │ HTTP API Requests
                                 ▼
                    ┌────────────────────────┐
                    │   Express.js Backend   │
                    │                        │
                    │ Routes & Controllers   │
                    │ Authentication         │
                    │ Authorization          │
                    │ Business Logic         │
                    │ Validation              │
                    └────────────┬───────────┘
                                 │
                    ┌────────────┴───────────┐
                    ▼                        ▼
          ┌──────────────────┐    ┌──────────────────┐
          │     MongoDB      │    │   Brevo API      │
          │                  │    │                  │
          │ Application Data │    │ Transactional    │
          │                  │    │ Emails            │
          └──────────────────┘    └──────────────────┘
```

---

## ✨ Features

### 🔐 1. Authentication & Authorization

- Email OTP verification during registration.
- Resend OTP functionality.
- Secure login using JWT stored in an httpOnly cookie.
- Password hashing with bcrypt.
- Protected frontend routes.
- Role-based access control.
- Profile updates and password changes.
- Server-side validation and centralized error handling.

### 🏢 2. Multi-Tenant SaaS Architecture

- Multiple restaurants operate through one platform.
- Restaurant-specific menus, tables, orders, and inventory.
- Restaurant-level subscription status.
- Tenant-scoped database queries.
- Subscription-aware feature access.
- Centralized platform management through Super Admin.

### 👥 3. Role-Based Dashboards

| Role | Access |
|---|---|
| Super Admin | Platform management, users, restaurants, subscriptions, notifications |
| Admin | Restaurant management, menu, tables, staff, inventory, subscription |
| Waiter | Order creation, menu, table management |
| Kitchen | Dedicated kitchen order-ticket board and permitted stock operations |

### 🍽️ 4. Order Management

- Dine-in and takeaway/packing orders.
- Customer details and guest count for dine-in orders.
- Table selection and availability tracking.
- Add more items to existing orders.
- Order status management.
- Order filtering by type and status.
- Digital invoice generation.
- Table release after eligible orders are completed.

### 📦 5. Menu & Inventory Management

- Create, update, and delete categories.
- Create, update, and delete dishes.
- Manage item prices, categories, and quantities.
- Restaurant-specific menu management.
- Automatic stock deduction when orders are placed.
- Automatic unavailability when stock reaches zero.
- Stock adjustment handling for competing orders.
- Category-based menu filtering.

### 🧾 6. Billing & Receipt Printing

- Interactive cart and order totals.
- Configurable tax settings in the administration interface.
- Cash and manual QR/UPI payment workflows.
- Printable receipt-style invoices.
- Direct thermal printing using WebUSB and ESC/POS-compatible printers.
- Printer connection checks and error messages.

**Payment clarification:** The application uses a manual QR/UPI payment verification workflow. It does not currently use an online payment gateway such as Razorpay.

### 📊 7. Dashboard & Analytics

- Revenue and order-volume metrics.
- Popular dish information.
- Recent orders.
- Business metric cards.
- Charts powered by Recharts.
- Excel exports using SheetJS.
- A dedicated kitchen interface.

### 🔔 8. Notification System

- In-app notification center.
- Unread notification indicators.
- Mark notifications as read.
- Mark all notifications as read.
- Super Admin announcements.
- Restaurant- or user-specific notifications.
- Polling-based order activity monitoring.
- Audio alerts for supported order and table events.

### 💳 9. Subscription Management

- Basic and Pro subscription plans.
- Monthly, four-month, and yearly durations.
- Server-side subscription pricing.
- Manual QR/UPI payment submission.
- Payment screenshot submission for review.
- Super Admin approval or rejection.
- Restaurant subscription status management.
- Subscription expiry handling.

---

## 🏗️ Project Structure

```text
restaurant-pos/
│
├── pos-backend/
│   ├── config/
│   │   ├── Database configuration
│   │   ├── Environment configuration
│   │   └── Subscription pricing
│   │
│   ├── controllers/
│   │   ├── User controllers
│   │   ├── Restaurant controllers
│   │   ├── Order controllers
│   │   ├── Table controllers
│   │   ├── Category controllers
│   │   ├── Dish controllers
│   │   ├── Subscription controllers
│   │   └── Notification controllers
│   │
│   ├── middlewares/
│   │   ├── Authentication
│   │   ├── Role authorization
│   │   └── Error handling
│   │
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── app.js
│
└── pos-frontend/
    └── src/
        ├── components/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── home/
        │   ├── invoice/
        │   ├── menu/
        │   ├── orders/
        │   ├── shared/
        │   ├── superadmin/
        │   └── tables/
        │
        ├── context/
        ├── https/
        ├── hooks/
        ├── pages/
        ├── redux/
        ├── utils/
        └── constants/
```

---

## 🔐 Environment Variables & Security

TryRestro uses environment variables for database connections, authentication secrets, email service credentials, and environment-specific configuration.

### Backend Environment Variables

Create a private `.env` file inside `pos-backend/`.

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_random_secret
FRONTEND_URL=http://localhost:5173

# Brevo transactional email configuration
BREVO_API_KEY=your_brevo_api_key
SMTP_FROM=your_verified_sender_email

# Initial Super Admin account configuration
SUPER_ADMIN_NAME=Your Name
SUPER_ADMIN_EMAIL=you@example.com
SUPER_ADMIN_PHONE=9999999999
SUPER_ADMIN_PASSWORD=replace_with_a_strong_password
```

### Frontend Environment Variables

Create a `.env` file inside `pos-frontend/`.

```env
VITE_BACKEND_URL=http://localhost:3000
```

The frontend backend URL should point to the correct backend service for the environment being used.

### Security Best Practices

- Never commit real `.env` files to GitHub.
- Never publish database connection strings, passwords, JWT secrets, or API keys.
- Use hosting-provider environment settings for production secrets.
- Keep `.env.example` files limited to placeholders and non-sensitive configuration.
- Never place private API keys in frontend variables.
- Variables prefixed with `VITE_` can be exposed in client-side bundles when used by frontend code.
- If a secret is accidentally published, rotate or revoke it immediately.
- Removing a secret from the latest commit does not automatically remove it from Git history.

### Recommended `.gitignore`

Add these rules to the root `.gitignore` file:

```gitignore
# Environment variables and secrets
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build output
dist/

# Debug logs
npm-debug.log*
```

Review existing ignore rules before changing them. If a secret file has already been committed, `.gitignore` alone will not stop Git from tracking it.

---

## ⚙️ Run Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas or a local MongoDB instance
- Git
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Replace the placeholders with your actual GitHub repository URL and project directory.

### 2. Install Backend Dependencies

```bash
cd pos-backend
npm install
```

Create the backend `.env` file using the example configuration above.

Start the backend:

```bash
npm run dev
```

### 3. Create the Super Admin Account

After setting the required `SUPER_ADMIN_*` environment variables, run:

```bash
node scripts/createSuperAdmin.js
```

Run this command from the `pos-backend` directory.

### 4. Install Frontend Dependencies

Open another terminal:

```bash
cd pos-frontend
npm install
```

Create the frontend `.env` file and configure `VITE_BACKEND_URL`.

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

> **Note:** The commands above follow the documented folder structure. If your checkout uses different directory names or npm scripts, follow the actual files in your repository.

---

## 🔒 Security Considerations

The application includes security-focused practices such as:

- Password hashing.
- JWT authentication.
- httpOnly authentication cookies.
- Server-side validation.
- Role-based authorization.
- MongoDB ObjectId validation.
- Restaurant-scoped queries.
- Centralized error handling.
- Server-side subscription pricing.
- Database constraints for pending subscription requests.
- Environment-based configuration.

Production deployment should additionally be reviewed for secure cookie settings, CORS configuration, rate limiting, CSRF exposure, upload validation, authorization boundaries, secret management, and appropriate logging.

These practices are not a substitute for a formal security audit.

---

## ⚠️ Known Limitation

### Tax Calculation

The billing interface supports a configurable restaurant tax rate, but the documented backend order calculation uses a separate hardcoded `TAX_RATE` constant.

The frontend preview and backend calculation should be reconciled before relying on custom restaurant tax settings in production.

---

## 🚧 Potential Future Improvements

- Reconcile frontend and backend tax calculations.
- Add automated unit and integration tests.
- Expand authorization and tenant-isolation tests.
- Improve monitoring and structured logging.
- Evaluate WebSocket-based updates if polling becomes insufficient.
- Add automated security testing.
- Review database indexes and query performance.
- Improve accessibility and responsive behavior.
- Document production deployment and recovery procedures.

These are potential improvements, not claims that they have already been implemented.

---

## 🧪 Testing Checklist

- [ ] Registration and email OTP verification.
- [ ] Login, logout, and protected routes.
- [ ] Role-based access for all four roles.
- [ ] Restaurant-level data isolation.
- [ ] Category and dish management.
- [ ] Inventory deduction and stock availability.
- [ ] Dine-in and takeaway order creation.
- [ ] Order status updates and table release.
- [ ] Billing and tax calculations.
- [ ] Subscription approval and rejection.
- [ ] Dashboard metrics and Excel export.
- [ ] Notifications and unread states.
- [ ] Thermal printer connection and receipt printing.
- [ ] Subscription expiry and access restrictions.

---

## 👨‍💻 Developer

**Rohit Bhatnagar**

BCA Student | Full-Stack Web Developer

Interested in full-stack development, backend architecture, SaaS applications, and building practical software products.

---

## 🌐 Links

- **Live Application:** [TryRestro](https://tryrestro.vercel.app/)
- **Source Code:** Available in this GitHub repository.

---

## 📄 License

No license has been specified in this README. Add a `LICENSE` file and update this section if you intend to distribute the project under a particular open-source license.

---

<p align="center">
  <strong>Built to simplify restaurant operations with modern web technologies.</strong>
  <br />
  <a href="https://tryrestro.vercel.app/">Explore TryRestro Live →</a>
</p>
