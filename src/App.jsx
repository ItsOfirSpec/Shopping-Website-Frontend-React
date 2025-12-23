import React, { useContext, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserContext } from "./context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";
import FloatingCart from "./components/FloatingCart";
// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import OrderProcess from "./pages/OrderProcess";
import ItemDetail from "./pages/ItemDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Category from "./pages/Category";
import Settings from "./pages/Settings";
import Similar from "./pages/Similar";

export default function App() {
  const { doLogout, user } = useContext(UserContext);

  const isServerDown = useRef(false);

  const handleServerDown = () => {
    if (!isServerDown.current) {
      isServerDown.current = true;

      if (user?.isLoggedIn) {
        localStorage.setItem("serverStatus", "offline");
        doLogout();
        toast.error("החיבור לשרת אבד — נותקת מהמערכת.");
      } else {
        toast.error("החיבור לשרת אבד — חלק מהפעולות לא יהיו זמינות.");
      }
    }
  };

  const handleServerRestored = () => {
    if (isServerDown.current) {
      isServerDown.current = false;
      toast.success("החיבור לשרת חודש בהצלחה.", {
        autoClose: 2000,
        onClose: () => {
          if (window.location.pathname === "/") {
            window.location.reload();
          }
        },
      });
    }
  };

  const checkServer = async () => {
    try {
      const response = await fetch("http://localhost:8080/ping");

      if (response.ok) {
        localStorage.setItem("serverStatus", "online");
        handleServerRestored();
      } else {
        handleServerDown();
      }
    } catch {
      handleServerDown();
    }
  };

  useEffect(() => {
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Header />
      <CategoryBar />

      <main className="p-4 min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <ProtectedRoute>
                <OrderProcess />
              </ProtectedRoute>
            }
          />

          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/similar/:id" element={<Similar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <ToastContainer
        position="top-center"
        autoClose={2000}
        rtl={true}
        pauseOnHover={false}
      />
      <FloatingCart></FloatingCart>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  return user?.isLoggedIn ? children : <Navigate to="/login" replace />;
}
