const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const PORT = config.port;

connectDB();

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "Hello from POS Server!",
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use(
  "/api/user",
  require("./routes/userRoute")
);

app.use(
  "/api/restaurant",
  require("./routes/restaurantRoute")
);

app.use(
  "/api/order",
  require("./routes/orderRoute")
);

app.use(
  "/api/table",
  require("./routes/tableRoute")
);

app.use(
  "/api/category",
  require("./routes/categoryRoute")
);

app.use(
  "/api/dish",
  require("./routes/dishRoute")
);

// Manual subscription requests
app.use(
  "/api/subscription-request",
  require("./routes/subscriptionRequestRoute")
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  globalErrorHandler
);

// ============================================================
// SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(
    `☑️ POS Server is listening on port ${PORT}`
  );
});