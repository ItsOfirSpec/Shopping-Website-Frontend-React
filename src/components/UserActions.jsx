import React, { useContext, useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaUserCircle,
  FaCog,
  FaSignInAlt,
  FaUserPlus,
  FaCoins
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import UserMenu from "./UserMenu";
import CurrencyMenu, { currencySymbols } from "./CurrencyMenu";

export default function UserActions() {
  const { user, logout } = useContext(UserContext);
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [openCurrencyMenu, setOpenCurrencyMenu] = useState(false);


  const [currentCurrency, setCurrentCurrency] = useState(
    localStorage.getItem("preferredCurrency") || "ILS"
  );

  useEffect(() => {
    const updateCurrency = () =>
      setCurrentCurrency(localStorage.getItem("preferredCurrency") || "ILS");

    window.addEventListener("currencyChanged", updateCurrency);
    return () => window.removeEventListener("currencyChanged", updateCurrency);
  }, []);

  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";
  const isSettings = location.pathname === "/settings";

  const buttonClass = (active, fullRound = false) =>
    `flex items-center justify-center space-x-1 rtl:space-x-reverse px-3 py-1 text-sm transition-colors ${
      active
        ? "bg-gray-800 text-white"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
    } ${fullRound ? "rounded-full" : "rounded-md"}`;

  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse relative">

      <Link to="/cart" className="relative">
        <FaShoppingCart className="text-2xl" />
        {user.cartItems?.length > 0 && (
          <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs rounded-full px-1">
            {user.cartItems.length}
          </span>
        )}
      </Link>

      {!user.isLoggedIn && (
        <>
          <Link to="/login" className={buttonClass(isLogin)}>
            <FaSignInAlt />
            <span>התחברות</span>
          </Link>
          <Link to="/signup" className={buttonClass(isSignup)}>
            <FaUserPlus />
            <span>הרשמה</span>
          </Link>
        </>
      )}

      {user.isLoggedIn && (
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-1 rtl:space-x-reverse px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          <FaSignInAlt />
          <span>התנתק</span>
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => {
            setOpenMenu((prev) => !prev);
            setOpenCurrencyMenu(false);
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          <FaUserCircle className="text-2xl" />
        </button>
        {openMenu && (
          <UserMenu user={user} onClose={() => setOpenMenu(false)} />
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setOpenCurrencyMenu((prev) => !prev);
            setOpenMenu(false);
          }}
          className="flex items-center justify-center w-10 h-10 p-1 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full transition"
        >
          <FaCoins className="text-xl" />
        </button>

        <span className="absolute -top-1 -left-1 bg-gray-800 text-white text-xs rounded-full px-1">
          {currencySymbols[currentCurrency]}
        </span>

        {openCurrencyMenu && (
          <CurrencyMenu onClose={() => setOpenCurrencyMenu(false)} />
        )}
      </div>

      <Link
        to="/settings"
        className={`flex items-center justify-center w-10 h-10 p-1 ${
          isSettings
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        } rounded-full`}
      >
        <FaCog className="text-xl" />
      </Link>
    </div>
  );
}
