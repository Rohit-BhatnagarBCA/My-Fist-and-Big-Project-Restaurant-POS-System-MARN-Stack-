# 🍽️ Restaurant POS System

A full-featured **Restaurant Point-of-Sale (POS) system** built on the MERN stack — designed to handle dine-in table management, takeaway/packing orders, live menu & inventory control, billing, direct thermal-printer receipts, and business analytics, all in one app.

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
| **Notifications** | Notistack |
| **Hardware** | WebUSB (direct ESC/POS thermal printer support) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (httpOnly cookies) + bcrypt |
| **Payments** | Razorpay (order creation, signature verification, webhooks) |

---

## 🎨 Design System

A custom "order ticket / receipt" visual theme runs across the whole app:

- **Colors** — Ink Navy `#12181F`, Paper Cream `#F3EEE3`, Rust Accent `#BD5D31`, Sage Green `#8FB89C`, Warm Amber `#e0a35c`
- **Typography** — Space Mono for labels/tags, Manrope for body text
- **Signature details** — torn-paper zigzag edges, dashed receipt-style dividers, circular status pills (matching real order-ticket aesthetics)

---

## ✨ Features

### Authentication & Access
1. Secure login/register with JWT stored in an httpOnly cookie
2. Passwords hashed with bcrypt (never returned in any API response)
3. Role-based access control (Admin vs Waiter/Kitchen roles)
4. Protected routes on the frontend — unauthenticated users are redirected to `/auth`

### Order Creation Flow
5. **Two order types at creation** — *On Table* (dine-in) or *Packing* (takeaway)
6. Dine-in orders collect customer name, phone & guest count, then go through table selection
7. Packing orders skip the name/phone step entirely — just guest/parcel count, straight to the menu
8. Floor-plan **Tables page** with live status (Available / Booked) and seat count
9. Strict flow validation — a table can't be opened without first starting an order

### Menu & Inventory
10. Full **Category CRUD** (add/edit/delete, with cascade-delete of dishes in a deleted category)
11. Full **Dish CRUD** (name, price, category, stock quantity)
12. **Stock / inventory auto-tracking** — placing an order automatically deducts dish stock
13. Dishes auto-flip to "unavailable" the moment their stock hits zero
14. Smart stock-adjustment — if two orders race for the last few units, the second order is trimmed automatically and the waiter is notified of exactly what changed
15. Live, database-driven menu with category filters

### Cart, Billing & Orders
16. Cart with add/remove items and running totals
17. Automatic tax calculation on every bill
18. **Cash** and **Razorpay Online** payment methods, with signature-verified payments and webhook support
19. **Add More Items** — reopen an already-placed order (Dine-in or Packing) straight from its receipt popup and merge new dishes into the *same* bill, instead of creating a duplicate order
20. Order status flow: **In Progress → Ready**, with the receipt popup auto-closing the moment a status action succeeds
21. **Free Table** action (dine-in only) to release a table once its order is Ready, with a confirmation step
22. Orders page with filter tabs: **All / In Progress / Ready / Completed / Packing**
23. Order-type circle badges on every order card (🟠 Packing / 🟢 On Table) for at-a-glance identification
24. Printable, receipt-styled digital invoice on order placement

### Hardware — Direct Printing
25. WebUSB integration for direct connection to ESC/POS thermal receipt printers (no OS print dialog)
26. One-click bill printing from the cart, with connection-status checks and clear error messaging

### Dashboard & Analytics
27. Real business-data analytics (revenue, order volume, popular dishes) powered by Recharts
28. Recent orders feed and key metrics cards
29. **Excel export** of order/business data via SheetJS, with cleanup reminders
30. Admin-only **bulk delete** of completed orders to keep the dashboard clean

### Data Integrity & Security
31. Server-side validation on every route (categories, dishes, orders, tables, users)
32. Global centralized error-handling middleware with environment-aware stack traces
33. MongoDB ObjectId validation guards on every param-based lookup
34. Route ordering safeguards (e.g. `/completed` and `/:id/items` resolved before the generic `/:id` route)

---

## 📁 Project Structure

```
├── pos-backend/                 # Express + MongoDB API
│   ├── config/                  # DB connection & environment config
│   ├── controllers/             # Route logic (user, order, table, category, dish, payment)
│   ├── middlewares/              # Auth verification, role checks, global error handler
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routers
│   └── app.js                   # App entry point
│
└── pos-frontend/                # React + Vite client
    └── src/
        ├── components/          # Auth, dashboard, home, menu, orders, tables, shared UI
        ├── context/              # PrinterContext (WebUSB ESC/POS)
        ├── https/                # Centralized API layer (axios)
        ├── pages/                # Route-level pages (Home, Menu, Orders, Tables, Dashboard, Auth)
        ├── redux/                # Redux Toolkit slices (user, cart, customer) + store
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
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

**`pos-frontend/.env`**
```
VITE_BACKEND_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🚀 Running Locally

**Backend**
```bash
cd pos-backend
npm install
npm run dev
```

**Frontend**
```bash
cd pos-frontend
npm install
npm run dev
```

The frontend runs on Vite's default port and talks to the backend via `VITE_BACKEND_URL`.

---

## 📺 Resources

<!-- - 🎬 [YouTube tutorial playlist](https://www.youtube.com/playlist?list=PL9OdiypqS7Nk0DHnSNFIi8RgEFJCIWB6X)
- 📦 [Project assets](https://drive.google.com/drive/folders/193N-F1jpzyfPCRCLc9wCyaxjYu2K6PC_)
- 🗺️ [Original flow chart](https://app.eraser.io/workspace/IcU1b6EHu9ZyS9JKi0aY?origin=share)
- 💡 [UI/UX design reference](https://www.behance.net/gallery/210280099/Restaurant-POS-System-Point-of-Sale-UIUX-Design) -->

---

✨ Feel free to explore, contribute, and enhance the project!