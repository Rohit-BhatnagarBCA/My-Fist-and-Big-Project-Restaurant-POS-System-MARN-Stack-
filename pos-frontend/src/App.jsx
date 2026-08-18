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
} from "./pages";

import Header from "./components/shared/Header";
import NotificationListener from "./components/shared/NotificationListener";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth", "/about"];
  const { isAuth } = useSelector((state) => state.user);

  if (isLoading) return <FullScreenLoader />;

  return (
    <>
      <NotificationListener />

      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/auth"
          element={isAuth ? <Navigate to="/" /> : <Auth />}
        />

        {/* Temporary Subscription Page */}
        <Route path="/about" element={<About />} />

        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoutes blockRoles={["Kitchen"]}>
              <Tables />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoutes blockRoles={["Kitchen"]}>
              <Menu />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes blockRoles={["Kitchen", "Waiter"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children, blockRoles }) {
  const {
    isAuth,
    role,
    subscription,
  } = useSelector((state) => state.user);

  // ---------- Login Protection ----------
  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  // ---------- Role Protection ----------
  if (blockRoles && blockRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ---------- Subscription Protection ----------

  // Waiter / Kitchen linked to an Admin
  const linkedStaff = Boolean(subscription?.linkedAdminEmail);

  const hasStartDate = Boolean(subscription?.startDate);

  const expiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate)
    : null;

  const notExpired =
    !expiryDate || expiryDate >= new Date();

  const hasSubscription =
    linkedStaff || (hasStartDate && notExpired);

  // About page itself should remain accessible.
  const currentPath = window.location.pathname;

  if (!hasSubscription && currentPath !== "/about") {
    return <Navigate to="/about" replace />;
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