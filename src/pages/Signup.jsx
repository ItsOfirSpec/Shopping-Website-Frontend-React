// src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import PasswordInput from "../components/PasswordInput";
import { useNavigate } from "react-router-dom";

const israeliPrefixes = [
  "050",
  "051",
  "052",
  "053",
  "054",
  "055",
  "057",
  "058",
  "059",
  "072",
  "073",
  "074",
  "076",
  "077",
  "078",
];

export default function Signup() {
  const { signup } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phonePrefix: "052",
    phoneNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const validatePasswordRules = (password) => {
    const errs = [];
    if (!password || password.length < 8)
      errs.push("הסיסמה חייבת להיות לפחות 8 תווים.");
    if (!/[A-Z]/.test(password))
      errs.push("הסיסמה חייבת לכלול לפחות אות גדולה אחת.");
    if (!/[a-z]/.test(password))
      errs.push("הסיסמה חייבת לכלול לפחות אות קטנה אחת.");
    if (!/\d/.test(password)) errs.push("הסיסמה חייבת לכלול לפחות ספרה אחת.");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errs.push(
        'הסיסמה חייבת לכלול לפחות תו מיוחד אחד (!@#$%^&*(),.?":{}|<>).'
      );
    return errs;
  };

  const computePasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    const categories = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ].filter(Boolean).length;
    score += Math.min(3, categories);
    if (score > 4) score = 4;
    return score;
  };

  const strength = computePasswordStrength(form.password);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, phoneNumber: digits.slice(0, 7) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = [];

    if (!form.firstName.trim())
      validation.push("שם פרטי ריק, אנא מלא אותו כדי להמשיך.");
    if (!form.lastName.trim())
      validation.push("שם משפחה ריק, אנא מלא אותו כדי להמשיך.");
    if (!form.email || !emailRegex.test(form.email))
      validation.push("כתובת המייל אינה תקינה.");
    if (!form.phoneNumber || form.phoneNumber.length < 7)
      validation.push("הטלפון אינו תקין. יש להזין 7 ספרות לאחר הקידומת.");
    const passwordErrors = validatePasswordRules(form.password);
    if (passwordErrors.length > 0) validation.push(...passwordErrors);

    if (validation.length > 0) {
      setErrors(validation);
      return;
    }

    setErrors([]);

    const intlPhone = `+972${form.phonePrefix.slice(1)}${form.phoneNumber}`;
    const signupForm = {
      firstname: form.firstName.trim(),
      lastname: form.lastName.trim(),
      email: form.email.trim(),
      phone: intlPhone,
      password: form.password,
    };
    signup(signupForm,()=> {
      const isStillSignupPage = document.location.pathname === "/signup";
      if(isStillSignupPage) navigate("/")
    });
  };

  return (
    <div className="flex justify-center mt-10 px-4" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 border border-gray-200"
      >
        <h2 className="text-2xl text-center font-bold text-red-600 mb-2">
          הרשמה
        </h2>

        <input
          name="firstName"
          value={form.firstName}
          onChange={handleInput}
          placeholder="שם פרטי"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          required
        />

        <input
          name="lastName"
          value={form.lastName}
          onChange={handleInput}
          placeholder="שם משפחה"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          required
        />

        <input
          name="email"
          value={form.email}
          onChange={handleInput}
          placeholder="אימייל"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          required
        />

        <div className="flex gap-2" dir="ltr">
          <select
            name="phonePrefix"
            value={form.phonePrefix}
            onChange={handleInput}
            className="w-28 p-2 border rounded bg-white focus:ring-2 focus:ring-red-400"
          >
            {israeliPrefixes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="הזן 7 ספרות"
            className="flex-1 border rounded p-2 focus:ring-2 focus:ring-red-400"
            inputMode="numeric"
            required
          />
        </div>

        <PasswordInput
          value={form.password}
          onChange={(e) =>
            handleInput({ target: { name: "password", value: e.target.value } })
          }
        />

        <div className="space-y-2">
          <div className="flex gap-1">
            <div
              className={`h-2 flex-1 rounded ${
                strength >= 1
                  ? strength === 1
                    ? "bg-red-500"
                    : "bg-yellow-400"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded ${
                strength >= 2
                  ? strength === 2
                    ? "bg-yellow-400"
                    : "bg-green-400"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded ${
                strength >= 3 ? "bg-green-400" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded ${
                strength >= 4 ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          </div>
          <div className="text-xs text-gray-600">
            {form.password
              ? strength < 2
                ? "חלשה"
                : strength === 2
                ? "סבירה"
                : strength === 3
                ? "טובה"
                : "חזקה"
              : "הכנס סיסמה להצגת חוזקה"}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {errors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
        >
          הרשמה
        </button>
      </form>
    </div>
  );
}
