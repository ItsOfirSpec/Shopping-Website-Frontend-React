import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import UserItemCard from "../components/UserItemCard";

export default function Settings() {
  const { user, cartData, doLogout, updateUser, apiHost } = useContext(UserContext);

  const isLoggedIn = !!user?.isLoggedIn;
  const [activeTab, setActiveTab] = useState(isLoggedIn ? "profile" : "preferences");

  const [favoritesItems, setFavoritesItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [currency, setCurrency] = useState("ILS");
  
  useEffect(() => {
    const updateCurrency = () =>
      setCurrency(localStorage.getItem("preferredCurrency") || "ILS");

    window.addEventListener("currencyChanged", updateCurrency);
    return () => window.removeEventListener("currencyChanged", updateCurrency);
  }, []);

  useEffect(() => {
    if (!user) return;
    if(isLoggedIn) {
      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      setCity(user.city || "");
    }
    const savedCurrency = localStorage.getItem("preferredCurrency");
    setCurrency(savedCurrency || user.currency || "ILS");

    const loadItemsWithImages = async (itemIds) => {
      const items = await Promise.all(
        [...new Set(itemIds || [])].map(async (id) => {
          const res = await fetch(`${apiHost}/api/items/${id}`);
          if (!res.ok) return null;

          let item = await res.json();

          let imageList = [];
          try {
            imageList = JSON.parse(item.images);
          } catch {
            console.warn("Invalid images format:", item.id);
          }

          const fullImages = imageList.map((filename) => {
            const [itemId, ext] = filename.split("_");
            const [imageId] = ext.split(".");
            return `${apiHost}/api/getitemimage/${item.categoryid}/${itemId}/${imageId}`;
          });

          return { ...item, images: fullImages };
        })
      );

      return items.filter(Boolean);
    };

    const loadFavoritesAndCart = async () => {
      setFavoritesItems(await loadItemsWithImages(user.favoriteItems));
      setCartItems(await loadItemsWithImages(user.cartItems));
    };

    loadFavoritesAndCart();
  }, [user, apiHost, isLoggedIn]);

  const inputClass =
    "border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-right";

  const isHebrew = (text) => /^[\u0590-\u05FF0-9\s]+$/.test(text);
  const getDir = (text) =>
    !text || /^[0-9\s]+$/.test(text) ? "ltr" : isHebrew(text) ? "rtl" : "ltr";

  const handleSave = () => {
    if(activeTab==="preferences") {
      window.dispatchEvent(new Event("currencyChanged"));
      localStorage.setItem("preferredCurrency", currency);
    }
    setMessage("השינויים נשמרו בהצלחה!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 mb-20">
      {message && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-right">
          {message}
        </div>
      )}


      <div className="flex border-b mb-6">

        {isLoggedIn && (
          <button
            className={`px-4 py-2 ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            פרופיל
          </button>
        )}

        {isLoggedIn && (
          <button
            className={`px-4 py-2 ${
              activeTab === "security"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("security")}
          >
            סיסמה
          </button>
        )}

        <button
          className={`px-4 py-2 ${
            activeTab === "preferences"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("preferences")}
        >
          העדפות
        </button>

          <button
            className={`px-4 py-2 ${
              activeTab === "favorites"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            מועדפים וסל
          </button>
      </div>

      {isLoggedIn && activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div>
            <label>שם פרטי</label>
            <input
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className={inputClass}
              dir={getDir(firstname)}
            />
          </div>

          <div>
            <label>שם משפחה</label>
            <input
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className={inputClass}
              dir={getDir(lastname)}
            />
          </div>

          <div>
            <label>מדינה</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
              dir={getDir(country)}
            />
          </div>

          <div>
            <label>עיר</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
              dir={getDir(city)}
            />
          </div>

          <div className="md:col-span-2">
            <label>טלפון</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2">
            <label>אימייל</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              dir="ltr"
            />
          </div>
        </div>
      )}

      {isLoggedIn && activeTab === "security" && (
        <div className="grid gap-6 text-right">
          <div className="relative">
            <label>סיסמה נוכחית</label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
            <span
              className="absolute left-4 top-11 cursor-pointer"
              onClick={() => setShowCurrentPassword((v) => !v)}
            >
              👁
            </span>
          </div>

          <div className="relative">
            <label>סיסמה חדשה</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
            <span
              className="absolute left-4 top-11 cursor-pointer"
              onClick={() => setShowNewPassword((v) => !v)}
            >
              👁
            </span>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="text-right">
          <label>מטבע מועדף</label>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              localStorage.setItem("preferredCurrency", e.target.value);
            }}
            className={inputClass}
          >
            <option value="ILS">שקל (₪)</option>
            <option value="USD">דולר ($)</option>
            <option value="EUR">אירו (€)</option>
            <option value="GBP">פאונד (£)</option>
            <option value="JPY">ין יפני (¥)</option>
            <option value="CAD">דולר קנדי (CA$)</option>
          </select>
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="space-y-6 text-right">
          <h2 className="font-semibold">מוצרים מועדפים</h2>
          {favoritesItems.length === 0 && <p>אין מוצרים מועדפים.</p>}
          {favoritesItems.map((item) => (
            <UserItemCard key={item.id} item={item} showRemove={false} />
          ))}

          <h2 className="font-semibold mt-6">סל הקניות</h2>
          {cartItems.length === 0 && <p>סל הקניות ריק.</p>}
          {cartItems.map((item) => {
            const quantity = cartData.find(cartitem => cartitem.itemid === item.id).quantity;
            return <UserItemCard key={item.id} itemId={item.id} quantity={quantity} />;
          })}
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          שמור שינויים
        </button>

        {isLoggedIn && (
          <button
            onClick={doLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            התנתק
          </button>
        )}
      </div>
    </div>
  );
}
