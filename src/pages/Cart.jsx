import { useContext, useEffect, useState } from "react"; 
import { UserContext } from "../context/UserContext";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaLock } from "react-icons/fa";
import { formatPrice } from "../utils/currency";
import { useNavigate } from "react-router-dom";

const isValidCardNumber = (number) => {
  const digits = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return digits.length >= 13 && sum % 10 === 0;
};

const isValidCVV = (cvv) => /^\d{3,4}$/.test(cvv);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const detectCardType = (number) => {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6/.test(n)) return "Discover";
  return null;
};

const formatCardNumber = (v) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

const countries = [
  "ישראל","ארצות הברית","קנדה","בריטניה","גרמניה","צרפת","ספרד","איטליה",
  "הולנד","בלגיה","שוודיה","נורווגיה","דנמרק","פינלנד","שווייץ",
  "אוסטרליה","ניו זילנד","יפן","סין","הודו","ברזיל","מקסיקו","דרום אפריקה"
];

function AuthModal({ onClose }) {
  const navigate = useNavigate();
  return (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4">
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn"
      dir="rtl"
    >
      <button
        onClick={onClose}
        className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 text-xl"
      >
        ✕
      </button>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <FaShoppingCart className="text-red-500 text-3xl" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-center mb-2">
        כדי להמשיך לרכישה
      </h3>
      <p className="text-gray-500 text-center mb-6 leading-relaxed">
        עליך להיות משתמש מחובר  
        <br />
        התחבר או הירשם כדי להשלים את ההזמנה
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/login")}
          className="flex-1 border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-xl font-semibold transition"
        >
          התחברות
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition"
        >
          הרשמה
        </button>
      </div>
    </div>
  </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { user, apiHost, cartData, updateCartItem, deleteCartItem } = useContext(UserContext);

  const [itemsData, setItemsData] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState(null);

  const [card, setCard] = useState({ holder: "", number: "", expiry: "", cvv: "" });
  const [customer, setCustomer] = useState({ firstName: "", lastName: "", phone: "", email: "", country: "ישראל", city: "", address: "" });

  useEffect(() => {
    if (!user?.cartItems?.length) return;
    user.cartItems.forEach((id) => {
      if (itemsData[id]) return;
      fetch(`${apiHost}/api/items/${id}`)
        .then((r) => r.json())
        .then((item) => {
          let imgs = [];
          try { imgs = JSON.parse(item.images); } catch {}
          const images = imgs.map((f) => {
            const [iid, rest] = f.split("_");
            const [img] = rest.split(".");
            return `${apiHost}/api/getitemimage/${item.categoryid}/${iid}/${img}`;
          });
          setItemsData((p) => ({ ...p, [id]: { ...item, images } }));
        });
    });
  }, [user.cartItems, itemsData, apiHost]);

  const getQty = (id) => {
    const i = cartData.find((x) => x.itemid === id);
    return i ? Math.max(i.quantity, 1) : 1;
  };

  const total = user.cartItems.reduce((s, id) => {
    const i = itemsData[id];
    return s + (i?.price || 0) * getQty(id);
  }, 0);

  const validateCustomerStep = () => {
    const e = {};
    if (!customer.firstName.trim()) e.firstName = true;
    if (!customer.lastName.trim()) e.lastName = true;
    if (!/^\d{9,}$/.test(customer.phone)) e.phone = true;
    if (!isValidEmail(customer.email)) e.email = true;
    if (!customer.city.trim()) e.city = true;
    if (!customer.address.trim()) e.address = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkout = () => {
    if (!user.isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  if (!user?.cartItems?.length) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <FaShoppingCart className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">הסל שלך ריק</h2>
          <p className="text-gray-500 mb-6">עדיין לא הוספת מוצרים לעגלה</p>
          <button onClick={() => navigate("/")} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold">חזרה לחנות</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">עגלת קניות</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {user.cartItems.map((id) => {
            const item = itemsData[id];
            if (!item) return null;
            const qty = getQty(id);
            return (
              <div key={id} className="bg-white rounded-xl shadow p-4 flex gap-4">
                <img src={item.images?.[0]} className="w-28 h-28 object-cover rounded-lg" alt="" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg hover:text-red-600 cursor-pointer" onClick={() => navigate(`/item/${item.id}`)}>{item.title}</h3>
                    <div className="text-gray-500 text-sm">{formatPrice(item.price)} ליחידה</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartItem(item, qty - 1)} className="p-2 bg-gray-100 rounded"><FaMinus /></button>
                      <span className="w-8 text-center">{qty}</span>
                      <button onClick={() => updateCartItem(item, qty + 1)} className="p-2 bg-gray-100 rounded"><FaPlus /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-red-600">{formatPrice(qty * item.price)}</span>
                      <button onClick={() => deleteCartItem(item, null)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4">סיכום הזמנה</h2>
          <div className="flex justify-between mb-2"><span>פריטים:</span><span>{user.cartItems.length}</span></div>
          <div className="flex justify-between font-bold text-lg mb-4"><span>סה״כ:</span><span className="text-red-600">{formatPrice(total)}</span></div>
          <button onClick={checkout} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold">שלם עכשיו</button>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => { setShowPaymentModal(false); setStep(1); }} className="absolute top-3 left-3 text-gray-400 text-xl">✕</button>
            <div className="flex items-center mb-6">
              {[1,2,3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <button onClick={() => s <= step && setStep(s)} className={`w-9 h-9 rounded-full font-bold ${step >= s ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"}`}>{s}</button>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? "bg-red-500" : "bg-gray-200"}`}/>}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-center">פרטי תשלום</h3>
                <input placeholder="שם בעל הכרטיס" className="w-full border rounded-lg px-3 py-2" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
                <div className="relative">
                  <input dir="ltr" placeholder="מספר כרטיס" className="w-full border rounded-lg px-3 py-2 pr-20 text-left"
                    value={card.number}
                    onChange={(e) => { const f = formatCardNumber(e.target.value); setCard({ ...card, number: f }); setCardType(detectCardType(f)); }}
                  />
                  {cardType && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{cardType}</span>}
                </div>
                <div className="flex gap-3">
                  <input placeholder="MM/YY" className="flex-1 border rounded-lg px-3 py-2" value={card.expiry} onChange={(e)=>setCard({...card,expiry:e.target.value})}/>
                  <input placeholder="CVV" className="flex-1 border rounded-lg px-3 py-2" value={card.cvv} onChange={(e)=>setCard({...card,cvv:e.target.value})}/>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500"><FaLock />פרטי התשלום שלך מוצפנים ומאובטחים</div>
                <button onClick={() => { setLoading(true); setTimeout(()=>{ setLoading(false); setStep(2); },1500); }} className="w-full bg-red-500 text-white py-2 rounded-xl">המשך</button>
                {loading && <div className="flex justify-center"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-center">פרטי משלוח</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="שם פרטי" className={`border rounded-lg px-3 py-2 ${errors.firstName && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,firstName:e.target.value})} />
                  <input placeholder="שם משפחה" className={`border rounded-lg px-3 py-2 ${errors.lastName && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,lastName:e.target.value})} />
                  <input placeholder="טלפון" className={`border rounded-lg px-3 py-2 ${errors.phone && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,phone:e.target.value})} />
                  <input placeholder="אימייל" className={`border rounded-lg px-3 py-2 ${errors.email && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,email:e.target.value})} />
                  <select className="border rounded-lg px-3 py-2" onChange={(e)=>setCustomer({...customer,country:e.target.value})}>{countries.map((c)=><option key={c}>{c}</option>)}</select>
                  <input placeholder="עיר" className={`border rounded-lg px-3 py-2 ${errors.city && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,city:e.target.value})} />
                  <input placeholder="כתובת מלאה" className={`border rounded-lg px-3 py-2 col-span-2 ${errors.address && "border-red-500"}`} onChange={(e)=>setCustomer({...customer,address:e.target.value})} />
                </div>
                <button onClick={() => { if(!validateCustomerStep()) return; setLoading(true); setTimeout(()=>{ setLoading(false); setStep(3); },1500); }} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold">שלם עכשיו</button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">התשלום בוצע בהצלחה</h3>
                <p className="text-gray-500">ההזמנה התקבלה ונשלחה אליך במייל</p>
                <button onClick={() => { user.cartItems.forEach(id=>{ const item=itemsData[id]; if(item) deleteCartItem(item,null); }); setShowPaymentModal(false); }} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold">הצג את ההזמנה</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
