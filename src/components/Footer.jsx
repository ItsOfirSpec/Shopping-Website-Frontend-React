import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 rtl w-full border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-right">
          <h3 className="font-bold mb-2">שירות לקוחות</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-red-500">מרכז עזרה</a></li>
            <li><a href="#" className="hover:text-red-500">מחלוקות ודיווחים</a></li>
            <li><a href="#" className="hover:text-red-500">מדיניות החזרה</a></li>
          </ul>
        </div>

        <div className="text-right">
          <h3 className="font-bold mb-2">אודות הקנייה אצלנו</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-red-500">ביצוע תשלום</a></li>
            <li><a href="#" className="hover:text-red-500">אפשרויות משלוח</a></li>
            <li><a href="#" className="hover:text-red-500">הגנת הקונה</a></li>
          </ul>
        </div>

        <div className="text-right">
          <h3 className="font-bold mb-2">הישארו מעודכנים</h3>
          <div className="flex gap-4 justify-end text-sm">
            <a href="#" className="hover:text-blue-600 text-2xl"><FaFacebookF /></a>
            <a href="#" className="hover:text-blue-400 text-2xl"><FaTwitter /></a>
            <a href="#" className="hover:text-pink-600 text-2xl"><FaInstagram /></a>
          </div>
        </div>

        <div className="text-right">
          <h3 className="font-bold mb-2">שתפו איתנו פעולה</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-red-500">תוכנית שותפים</a></li>
            <li><a href="#" className="hover:text-red-500">מכירת מוצרים</a></li>
            <li><a href="#" className="hover:text-red-500">כניסה למוכרים</a></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-300 text-gray-700 text-sm text-center py-2 mt-2">
        © {currentYear}  כל הזכויות שמורות לאופיר 
      </div>
    </footer>
  );
}
