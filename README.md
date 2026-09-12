# 🍽️ Restaurant POS System

A full-featured, **multi-tenant Restaurant Point-of-Sale (POS) SaaS platform** built on the MERN stack — every restaurant that signs up gets its own isolated dine-in table management, takeaway/packing orders, live menu & inventory control, billing, direct thermal-printer receipts, business analytics, staff accounts, and a subscription-gated business model, all managed from a Super Admin control panel.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS (custom "receipt / ticket" design system) |
| **State Management** | Redux Toolkit |
| **Data Fetching & Caching** | TanStack React Query |
| **Routing** | React Router v7 |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Excel Export** | SheetJS (xlsx) |
| **Notifications** | Notistack (toasts) + in-app Notification Center with Web Audio alert tones |
| **Hardware** | WebUSB (direct ESC/POS thermal printer support) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (httpOnly cookies) + bcrypt + email OTP verification |
| **Payments** | Manual QR/UPI payment flow (no payment gateway — screenshot upload + Super Admin review) |
| **Transactional Email** | Brevo HTTP API (used instead of raw SMTP for cloud-host reliability) |

> Razorpay has been fully removed from this project — there is no online payment gateway integration anymore. All "Online" payments are manual QR/UPI transfers verified by a human Super Admin.

---

## 🎨 Design System

A custom "order ticket / receipt" visual theme runs across the whole app:

- **Colors** — Ink Navy `#12181F`, Paper Cream `#F3EEE3`, Rust Accent `#BD5D31`, Sage Green `#8FB89C`, Warm Amber `#e0a35c`
- **Typography** — Space Mono for labels/tags, Manrope for body text
- **Signature details** — torn-paper zigzag edges, dashed receipt-style dividers, circular status pills (matching real order-ticket aesthetics)

---

## 🏢 Multi-Tenant SaaS Architecture

This is not a single-restaurant app — it's a platform where **every restaurant is its own isolated tenant**:

- Every core resource (`Category`, `Dish`, `Table`, `Order`, `Notification`) is scoped to a `restaurantId`. All queries and mutations are filtered by the requesting user's restaurant — one restaurant can never see or touch another's data.
- A `Restaurant` document is the **single source of truth** for that tenant's subscription status (`pending` / `active` / `suspended` / `expired`), tax rate, and plan details.
- Restaurant status is **auto-synced on every authenticated request** (in the `isVerifiedUser` middleware) by comparing the current time against the stored subscription start/expiry dates — no cron job needed.
- Frontend route protection (`App.jsx`) reads `restaurant.status` as the single gate for all POS features (Home, Orders, Tables, Menu, Dashboard, Staff) — if a restaurant isn't `active`, every staff member (Admin, Waiter, Kitchen) is redirected to `/about` regardless of their individual account.

### Roles
| Role | Access |
|---|---|
| **SuperAdmin** | Platform owner. Manages all restaurants, all users, subscription approvals, and can broadcast notifications. Has a completely separate `/super-admin` panel and is never shown the normal POS UI. |
| **Admin** | Owns one restaurant. Manages staff, menu, tables, tax settings, and subscription. |
| **Waiter** | Takes orders, manages tables, views the menu. Blocked from Dashboard/Staff. |
| **Kitchen** | Gets a dedicated live order-ticket board (`KitchenBoard`) instead of the normal Home dashboard — no analytics clutter, just what to cook next. |

---

## ✨ Features

### Authentication & Onboarding
1. **OTP-based email verification on signup** — registering does **not** create an account immediately. Details are held in a short-lived `PendingRegistration` record (auto-deleted after 15 minutes via MongoDB TTL index); the real `User` + `Restaurant` are only created once the 6-digit email OTP is verified.
2. "Resend OTP" flow for expired/undelivered codes
3. Secure login with JWT stored in an httpOnly cookie; passwords hashed with bcrypt (never returned in any API response)
4. New Admin accounts must have a verified email to log in; legacy/staff accounts are exempt
5. Role-based access control across 4 roles (Waiter / Kitchen / Admin / SuperAdmin)
6. Protected routes on the frontend, with restaurant-subscription-aware redirects (see Multi-Tenant section above)
7. Profile self-service — update name/phone and change password without needing a re-verified email

### Restaurant Onboarding & Subscription (SaaS billing)
8. Every new Admin gets their own `Restaurant` record created automatically on email verification, starting in `pending` status
9. **Two business plans** — Basic and Pro — each priced across Monthly / 4-Month / Yearly durations, with all pricing centralized server-side (`config/pricing.js`) so a price can never be spoofed from the client
10. **Manual QR/UPI subscription flow** — Admin uploads a payment screenshot (validated for image type and size) plus an optional note; this creates a `SubscriptionRequest` pending Super Admin review
11. A MongoDB partial unique index guarantees at most **one pending request per restaurant** at any time, closing a race-condition window that a check-then-create alone can't fully prevent
12. Super Admin reviews requests — **Approve** (sets exact start/expiry date & time, recalculates the expected amount server-side to catch tampering, and activates/expires the restaurant automatically based on the chosen dates) or **Reject** (with a reason)
13. Restaurant status transitions (`pending` → `active` → `expired`) happen automatically as time passes, without any manual intervention
14. Super Admin can also directly view every registered restaurant, drill into one (owner, staff counts, table/category/dish/order counts) and manually override its status
15. Super Admin can view every user across the platform and manually toggle a user's own subscription window as a fallback/override tool

### Staff Management (per restaurant)
16. Admin can create Waiter/Kitchen accounts directly (auto-verified, no OTP needed since they're created internally)
17. List staff with live Waiter/Kitchen headcounts, update staff details/role, or remove a staff account

### In-App Notification System
18. Notification Center with unread badge, "mark as read" / "mark all as read"
19. Super Admin can broadcast a message to **all users**, one specific **restaurant**, or one specific **user**, with a type (announcement / subscription / warning / system) and optional expiry
20. A lightweight polling listener (mounted once at the app root) watches live order activity every 5 seconds and plays a generated two-tone alert (Web Audio API — no audio file shipped) whenever a new order comes in, an order is marked Ready, or a table frees up

### Order Creation Flow
21. **Two order types at creation** — *On Table* (dine-in) or *Packing* (takeaway)
22. Dine-in orders collect customer name, phone & guest count, then go through table selection
23. Packing orders skip the name/phone step entirely — just guest/parcel count, straight to the menu
24. Floor-plan **Tables page** with live status (Available / Booked) and seat count, scoped per restaurant
25. Strict flow validation — a table can't be opened without first starting an order

### Menu & Inventory
26. Full **Category CRUD** (add/edit/delete, with cascade-delete of dishes in a deleted category), unique per restaurant
27. Full **Dish CRUD** (name, price, category, stock quantity), scoped per restaurant
28. **Stock / inventory auto-tracking** — placing an order atomically deducts dish stock at the database level
29. Dishes auto-flip to "unavailable" the moment their stock hits zero
30. Smart stock-adjustment — if two orders race for the last few units, the second order is trimmed automatically and the waiter is notified of exactly what changed
31. Kitchen role can update stock via a dedicated endpoint without needing full Admin dish-edit rights
32. Live, database-driven menu with category filters

### Cart, Billing & Orders
33. Cart with add/remove items and running totals
34. **Per-restaurant configurable tax rate** — Admins set their own tax percentage in Settings; the billing UI shows a live preview using that rate
35. **Cash** and **Online (manual QR/UPI)** payment methods — there is no payment gateway; both follow the exact same order-creation flow
36. **Add More Items** — reopen an already-placed order (Dine-in or Packing) straight from its receipt popup and merge new dishes into the *same* bill, instead of creating a duplicate order
37. Order status flow: **In Progress → Ready**, with the receipt popup auto-closing the moment a status action succeeds
38. **Free Table** action (dine-in only) to release a table once its order is Ready, with a confirmation step
39. Orders page with filter tabs: **All / In Progress / Ready / Completed / Packing**
40. Order-type circle badges on every order card (🟠 Packing / 🟢 On Table) for at-a-glance identification
41. Printable, receipt-styled digital invoice on order placement

### Hardware — Direct Printing
42. WebUSB integration for direct connection to ESC/POS thermal receipt printers (no OS print dialog)
43. One-click bill printing from the cart, with connection-status checks and clear error messaging

### Dashboard & Analytics
44. Real business-data analytics (revenue, order volume, popular dishes) powered by Recharts
45. Kitchen role sees a dedicated live ticket board instead of the analytics dashboard
46. Recent orders feed and key metrics cards
47. **Excel export** of order/business data via SheetJS
48. Admin-only **bulk delete** of completed orders (only ones whose table is already free) to keep the dashboard clean

### Data Integrity & Security
49. Server-side validation on every route (categories, dishes, orders, tables, users, restaurants, subscription requests)
50. Global centralized error-handling middleware with environment-aware stack traces
51. MongoDB ObjectId validation guards on every param-based lookup
52. Route ordering safeguards (e.g. `/completed` and `/:id/items` resolved before the generic `/:id` route)
53. Every cross-tenant lookup (dishes, tables, orders, categories) is filtered by `restaurantId` at the database query level, not just checked in application code
54. Automatic restaurant subscription/expiry recalculation on every authenticated request — no stale "active" state can survive past its expiry

---

## ⚠️ Known Notes / Things to Be Aware Of

- **Tax rate is not yet fully wired end-to-end.** The Admin can set a custom tax rate in Settings, and the frontend billing preview (`Bill.jsx`) uses it — but the backend (`orderController.js`) currently calculates the final order tax using a separate hardcoded `TAX_RATE` constant, not the restaurant's stored `taxRate`. Worth reconciling before treating the tax-rate setting as fully functional in production.
- A couple of legacy leftovers exist in the backend that aren't part of the live flow: `models/paymentModel.js` (old Razorpay-era model, only referenced by the `resetDatabase` script) and `middlewares/adminVerification.js` (a duplicate of the `isAdmin` check already in `tokenVerification.js`).
- `nodemailer` and `resend` are listed as backend dependencies but the app currently sends email via the Brevo HTTP API directly (`utils/emailService.js`), not through either of those packages.

---

## 📁 Project Structure

```
├── pos-backend/                     # Express + MongoDB API
│   ├── config/                      # DB connection, environment config, subscription pricing
│   ├── controllers/                 # Route logic (user, restaurant, order, table, category,
│   │                                 #   dish, subscription request, notification)
│   ├── middlewares/                 # Auth verification (+ auto subscription sync), role
│   │                                 #   guards (Admin/SuperAdmin), global error handler
│   ├── models/                      # Mongoose schemas (User, Restaurant, PendingRegistration,
│   │                                 #   SubscriptionRequest, Notification, Order, Dish,
│   │                                 #   Category, Table)
│   ├── routes/                      # Express routers
│   ├── scripts/                     # One-off ops scripts (create Super Admin, DB reset,
│   │                                 #   legacy-data migration, table-index fix)
│   ├── utils/                       # Email service (Brevo API, OTP generation/hashing)
│   └── app.js                       # App entry point
│
└── pos-frontend/                    # React + Vite client
    └── src/
        ├── components/
        │   ├── auth/                 # Login, Register
        │   ├── dashboard/            # Metrics, Modal, RecentOrders, TaxSettings
        │   ├── home/                 # Greetings, KitchenBoard, MiniCard, PopularDishes, StockPanel
        │   ├── invoice/              # Printable invoice
        │   ├── menu/                 # Cart, Bill, MenuContainer
        │   ├── orders/               # OrderCard, OrderDetailsModal
        │   ├── shared/               # Header, BottomNav, NotificationListener, NotificationPanel, Modal
        │   ├── superadmin/           # NotificationComposer (broadcast tool)
        │   └── tables/               # TableCard
        ├── context/                  # PrinterContext (WebUSB ESC/POS)
        ├── https/                    # Centralized API layer (axios)
        ├── pages/                    # Home, Auth, VerifyEmail, About, Menu, Orders, Tables,
        │                             #   Dashboard, Staff, Profile, Subscription, SuperAdmin
        ├── redux/                    # Redux Toolkit slices (user, cart, customer, notification) + store
        └── hooks/, utils/, constants/
```

---

## ⚙️ Environment Variables

**`pos-backend/.env`**
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Transactional email (Brevo HTTP API)
BREVO_API_KEY=your_brevo_api_key
SMTP_FROM=your_verified_sender_email

# One-time Super Admin bootstrap (used by scripts/createSuperAdmin.js)
SUPER_ADMIN_NAME=Your Name
SUPER_ADMIN_EMAIL=you@example.com
SUPER_ADMIN_PHONE=9999999999
SUPER_ADMIN_PASSWORD=a_strong_password
```

**`pos-frontend/.env`**
```
VITE_BACKEND_URL=http://localhost:3000
```

---

## 🚀 Running Locally

**Backend**
```bash
cd pos-backend
npm install
npm run dev
```

**Create the platform's Super Admin account (one-time, after setting the `SUPER_ADMIN_*` env vars above)**
```bash
cd pos-backend
node scripts/createSuperAdmin.js
```

**Frontend**
```bash
cd pos-frontend
npm install
npm run dev
```

The frontend runs on Vite's default port and talks to the backend via `VITE_BACKEND_URL`.

---

<!-- ## 📺 Resources

- 🎬 [YouTube tutorial playlist](https://www.youtube.com/playlist?list=PL9OdiypqS7Nk0DHnSNFIi8RgEFJCIWB6X)
- 📦 [Project assets](https://drive.google.com/drive/folders/193N-F1jpzyfPCRCLc9wCyaxjYu2K6PC_)
- 🗺️ [Original flow chart](https://app.eraser.io/workspace/IcU1b6EHu9ZyS9JKi0aY?origin=share)
- 💡 [UI/UX design reference](https://www.behance.net/gallery/210280099/Restaurant-POS-System-Point-of-Sale-UIUX-Design)

--- -->

✨ Feel free to explore, contribute, and enhance the project!