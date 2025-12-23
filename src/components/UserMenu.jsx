import React, { useEffect, useRef } from "react";
import MenuItem from "./MenuItem";

export default function UserMenu({ user, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-12 left-0 w-60 bg-white shadow-lg rounded-2xl border border-gray-200 z-50 rtl"
    >
      <div className="flex flex-col p-2 space-y-2">
        {user.isLoggedIn && (
          <>
            <MenuItem to="/orders" icon="/menuicons/orders.svg">ההזמנות שלי</MenuItem>
            <MenuItem to="/coins" icon="/menuicons/coins.svg">המטבעות שלי</MenuItem>
            <MenuItem to="/messages" icon="/menuicons/messages.svg">מרכז ההודעות</MenuItem>
            <MenuItem to="/bonus" icon="/menuicons/bonus.svg">My Bonus</MenuItem>
            <MenuItem to="/wishlist" icon="/menuicons/wish.svg">רשימת בקשות</MenuItem>
            <MenuItem to="/coupons" icon="/menuicons/coupun.svg">הקופונים שלי</MenuItem>
          </>
        )}

        <MenuItem to="/settings" icon="/menuicons/settings.svg">הגדרות</MenuItem>

        <MenuItem to="/business">Business</MenuItem>
        <MenuItem to="/ds-center">DS Center</MenuItem>
        <MenuItem to="/seller-login">Seller Log In</MenuItem>
        <MenuItem to="/return-policy">מדיניות החזרה והחזר כספי</MenuItem>
        <MenuItem to="/help-center">מרכז עזרה</MenuItem>
        <MenuItem to="/disputes">מחלוקות</MenuItem>
        <MenuItem to="/report-ipr">דווח על הפרת IPR</MenuItem>
      </div>
    </div>
  );
}
