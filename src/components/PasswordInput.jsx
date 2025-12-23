import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

export default function PasswordInput({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full" dir="rtl">
      <label className="text-sm font-semibold">סיסמה</label>

      <div className="flex items-center gap-2 w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="הכנס סיסמה"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
