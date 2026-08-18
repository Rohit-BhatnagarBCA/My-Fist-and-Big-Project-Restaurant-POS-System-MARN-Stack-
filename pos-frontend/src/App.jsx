import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import {
  Home,
  Auth,
  About,
  Orders,
  Tables,
  Menu,
  Dashboard,
  Subscription,
  SuperAdmin,
} from "./pages";

import Header from "./components/shared/Header";
import NotificationListener from "./components/shared/NotificationListener";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();

  const hideHeaderRoutes = [
    "/auth",
    "/about",
    "/subscription",
    "/super-admin",
  ];

  const { isAuth } = useSelector(
    (state) => state.user
  );

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <NotificationListener />

      {!hideHeaderRoutes.includes(location.pathname) && (
        <Header />
      )}

      <Routes>
        {/* =====================================================
            HOME
           ===================================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />

        {/* =====================================================
            AUTH
           ===================================================== */}

        <Route
          path="/auth"
          element={
            isAuth ? (
              <Navigate to="/" replace />
            ) : (
              <Auth />
            )
          }
        />

        {/* =====================================================
            ABOUT
           ===================================================== */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* =====================================================
            SUBSCRIPTION
            Login required.
            Subscription NOT required.
           ===================================================== */}

        <Route
          path="/subscription"
          element={
            <AuthOnlyRoute>
              <Subscription />
            </AuthOnlyRoute>
          }
        />

        {/* =====================================================
            SUPER ADMIN
           ===================================================== */}

        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          }
        />

        {/* =====================================================
            ORDERS
           ===================================================== */}

        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />

        {/* =====================================================
            TABLES
           ===================================================== */}

        <Route
          path="/tables"
          element={
            <ProtectedRoutes
              blockRoles={["Kitchen"]}
            >
              <Tables />
            </ProtectedRoutes>
          }
        />

        {/* =====================================================
            MENU
           ===================================================== */}

        <Route
          path="/menu"
          element={
            <ProtectedRoutes
              blockRoles={["Kitchen"]}
            >
              <Menu />
            </ProtectedRoutes>
          }
        />

        {/* =====================================================
            DASHBOARD
           ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes
              blockRoles={[
                "Kitchen",
                "Waiter",
              ]}
            >
              <Dashboard />
            </ProtectedRoutes>
          }
        />

        {/* =====================================================
            FALLBACK
           ===================================================== */}

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#12181F] text-[#F3EEE3] flex items-center justify-center">
              Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}

// =============================================================
// AUTH ONLY
// =============================================================

function AuthOnlyRoute({
  children,
}) {
  const { isAuth } = useSelector(
    (state) => state.user
  );

  if (!isAuth) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return children;
}

// =============================================================
// SUPER ADMIN ROUTE
// =============================================================

function SuperAdminRoute({
  children,
}) {
  const {
    isAuth,
    role,
  } = useSelector(
    (state) => state.user
  );

  if (!isAuth) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  if (role !== "SuperAdmin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

// =============================================================
// NORMAL POS PROTECTION
// =============================================================

function ProtectedRoutes({
  children,
  blockRoles,
}) {
  const {
    isAuth,
    role,
    subscription,
  } = useSelector(
    (state) => state.user
  );

  // -----------------------------------------------------------
  // Login
  // -----------------------------------------------------------

  if (!isAuth) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  // -----------------------------------------------------------
  // Super Admin gets its own panel, not restaurant POS routes.
  // -----------------------------------------------------------

  if (role === "SuperAdmin") {
    return (
      <Navigate
        to="/super-admin"
        replace
      />
    );
  }

  // -----------------------------------------------------------
  // Role restriction
  // -----------------------------------------------------------

  if (
    blockRoles &&
    blockRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // -----------------------------------------------------------
  // Subscription
  // -----------------------------------------------------------

  const linkedStaff = Boolean(
    subscription?.linkedAdminEmail
  );

  const hasStartDate = Boolean(
    subscription?.startDate
  );

  const expiryDate =
    subscription?.expiryDate
      ? new Date(
          subscription.expiryDate
        )
      : null;

  const notExpired =
    !expiryDate ||
    expiryDate >= new Date();

  const hasSubscription =
    linkedStaff ||
    (hasStartDate &&
      notExpired);

  // -----------------------------------------------------------
  // No subscription
  // -----------------------------------------------------------

  if (!hasSubscription) {
    return (
      <Navigate
        to="/about"
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;