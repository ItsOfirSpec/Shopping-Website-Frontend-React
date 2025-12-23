import { useContext, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useItemById, useItemsBySimilar } from "../items/items";
import ErrorPage from "../components/ErrorPage";
import ColorSpinner from "../components/ColorSpinner";
import RelatedItemCard from "../components/RelatedItemCard";
import { UserContext } from "../context/UserContext";
import { ShoppingCart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "../utils/currency";
import { useNavigate } from "react-router-dom";

export default function ItemDetail() {
  const { id } = useParams();
  const itemId = parseInt(id, 10);
  const { user, updateUser, addToCart, deleteCartItem, cartData, updateCartItem } = useContext(UserContext);
  const { idItem, itemLoading, itemError } = useItemById(itemId);
  const { items: similarItems, loading: similarLoading } =
    useItemsBySimilar(itemId);
  const intervalRef = useRef(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [firstLoad, setFirstLoad] = useState(true);
  const navigate = useNavigate();

  const [currentCurrency, setCurrentCurrency] = useState(
    localStorage.getItem("preferredCurrency") || "ILS"
  );

  useEffect(() => {
    const updateCurrency = () =>
      setCurrentCurrency(localStorage.getItem("preferredCurrency") || "ILS");

    window.addEventListener("currencyChanged", updateCurrency);
    return () => window.removeEventListener("currencyChanged", updateCurrency);
  }, []);
  
  useEffect(() => {
    const handleCartChanged = () => {
      if (idItem) {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const inCart = userData?.cartItems?.includes(idItem.id);
        if(!inCart) saveQuantity(1);
        setCartAdded(inCart);
      }
    };
    window.addEventListener("cartChanged", handleCartChanged);
    return () => {
      window.removeEventListener("cartChanged", handleCartChanged);
    };
  }, []);

  useEffect(() => {
    if(idItem) {
      const item = cartData.find(c => c.itemid === idItem.id);
      if (item) setQuantity(item.quantity);
    }
  }, [cartData, idItem]);
  useEffect(() => {
    if (!idItem || !firstLoad) return;

    const cartItem = cartData.find(c => c.id === idItem.id);
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }

    setFirstLoad(false);
  }, [idItem, cartData, firstLoad]);

  if (itemLoading) return <ColorSpinner text="" randomColor />;
  if (itemError || !idItem)
    return (
      <ErrorPage
        status={404}
        message="המוצר שחיפשת לא קיים."
        actionText="חזור לדף הראשי"
        actionLink="/"
      />
    );

  const images = idItem.images?.length ? idItem.images : ["/placeholder.png"];

  const reviewsDemo = [
    {
      name: "נועה כהן",
      rating: 5,
      text: "מוצר מעולה! עונה על כל הציפיות שלי.",
    },
    {
      name: "יונתן לוי",
      rating: 4,
      text: "טוב מאוד, אבל יכל להיות עם מעט יותר צבע.",
    },
    {
      name: "שרית רוזן",
      rating: 5,
      text: "שירות מעולה ואיכות גבוהה. ממליצה בחום.",
    },
    { name: "דניאל אברמוב", rating: 3, text: "בסדר, אבל לא משהו יוצא דופן." },
  ];

  const calculateOriginalPrice = (discountedPrice, discountPercent) => {
    if (!discountPercent) return null;
    return discountedPrice / (1 - discountPercent / 100);
  };

  const originalPrice = calculateOriginalPrice(
    idItem.price,
    idItem.discountpercent
  );

  const prevImage = () =>
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);


  const increment = () => {
    setQuantity((prev) => {
      const newQ = prev + 1;
      updateCartItem(idItem, newQ);
      return newQ;
    });
  };

  const decrement = () => {
    setQuantity((prev) => {
      const newQ = prev > 1 ? prev - 1 : 1;
      (prev > newQ) ? updateCartItem(idItem, newQ) : deleteCartItem(idItem, null);
      return newQ;
    });
  };

  const saveQuantity = (q) => {
    setQuantity(q);
    updateCartItem(idItem, q);
  };


  const startIncrement = async () => {
    increment();
    if(intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      increment();
    }, 150);
  };

  const startDecrement = async () => {
    decrement();
    if(intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      decrement();
    }, 150);
  };

  const stopChange = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;

  };
  const handleCart = (div) => {
    if(inCart()) {
        saveQuantity(1);
        deleteCartItem(idItem, div);
    } else {
      addToCart(idItem, div, quantity);
    } 
  };
  const handleCheckout = (div) => {
    if(!inCart()) {
      addToCart(idItem, div, quantity);
    }
    navigate("/cart");
  }
  const inCart = () => user?.cartItems?.includes(idItem.id) || false;

  return (
    <div className="px-4 py-4" dir="rtl">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-2 flex flex-row-reverse gap-4">
          <div
            className="relative w-[420px] h-[420px] bg-gray-100 overflow-hidden cursor-pointer group shadow"
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={() => setHoverZoom(true)}
            onMouseLeave={() => setHoverZoom(false)}
          >
            <img
              src={images[activeImage]}
              alt={idItem.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                hoverZoom ? "scale-110" : "scale-99"
              }`}
            />
          </div>
          <div className="flex flex-col gap-2 h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-gray-200 p-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 object-cover rounded cursor-pointer border transition
      ${
        activeImage === i
          ? "ring-2 ring-red-500"
          : "opacity-70 hover:opacity-100"
      }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <h1 className="font-bold" style={{ fontSize: "20px" }}>
            {idItem.title}
          </h1>
          <div className="flex gap-4">
            <div
              className="flex items-center gap-1"
              style={{ fontSize: "25px" }}
            >
              {Array.from({ length: Math.round(idItem.stars || 0) }).map(
                (_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                )
              )}
              {Array.from({ length: 5 - Math.round(idItem.stars || 0) }).map(
                (_, i) => (
                  <span key={i} className="text-gray-300">
                    ★
                  </span>
                )
              )}
            </div>
            <span
              className="font-bold text-black flex items-center w-20"
              style={{ fontSize: "18px" }}
            >
              {idItem.stars || ""}
            </span>
          </div>
          <div className="flex gap-2">
            <div
              className="font-bold text-2xl"
              style={{ color: "rgb(253, 56, 79)", fontSize: "36px" }}
            >
              {formatPrice(idItem.price * quantity)}
            </div>
            {idItem.discountpercent && (
              <div className="flex items-end gap-3 mt-2">
                <div
                  className="text-black font-semibold"
                  style={{ fontSize: "16px", color: "rgb(253, 56, 79)" }}
                >
                  {idItem.discountpercent}% פחות
                </div>
                <span
                  className="line-through"
                  style={{ fontSize: "16px", color: "#8e90a1" }}
                >
                  {formatPrice(originalPrice)}
                </span>
              </div>
            )}
          </div>
          <div className="text-gray-700 text-sm">{idItem.sold || 0} נמכרו </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-700 font-semibold">כמות:</span>
            <div className="flex border border-red-600 rounded-lg overflow-hidden h-7 transition-transform">
              <button
                onPointerDown={startDecrement}
                onPointerUp={stopChange}
                onPointerLeave={stopChange}
                className="px-2 bg-red-600 hover:bg-red-700 text-base font-bold text-white transition-transform active:scale-90"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => saveQuantity(parseInt(e.target.value) || 1)}
                className="w-12 text-center outline-none focus:ring-0 text-sm font-semibold border-l border-r border-red-600"
              />
              <button
                onPointerDown={startIncrement}
                onPointerUp={stopChange}
                onPointerLeave={stopChange}
                className="px-2 bg-red-600 hover:bg-red-700 text-base font-bold text-white transition-transform active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              className="w-40 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
              onClick={(e) => handleCheckout(e.currentTarget)}>
              שלם עכשיו
            </button>

            <div className="flex flex-col gap-2">
              <button
                className={`w-40 py-2 ${inCart() ? "bg-black text-white border border-black hover:bg-gray-900" : "bg-white text-black border border-black hover:bg-gray-100"} font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95`}
                onClick={(e) => handleCart(e.currentTarget)}
              >
                <ShoppingCart size={20} />
                {inCart()
                  ? "הסר מהעגלה"
                  : "הוסף לעגלה"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1">
            <div className="text-gray-700">משלוחים: משלוח חינם מעל 200₪</div>
            <div className="text-gray-700">
              קופונים: 10% הנחה בקנייה מעל 100₪
            </div>
            <div className="text-gray-700">משובים: ★★★★☆ (12 חוות דעת)</div>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">חוות דעת משתמשים</h2>
        <div className="flex flex-col gap-4">
          {reviewsDemo.map((review, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="flex items-center gap-2 min-w-[150px]">
                <span className="text-yellow-400 text-lg">
                  {Array.from({ length: review.rating }).map(() => "★")}
                  {Array.from({ length: 5 - review.rating }).map(() => "☆")}
                </span>
                <span className="font-semibold text-gray-700">
                  {review.name}
                </span>
              </div>
              <p className="text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">מוצרים דומים</h2>
        <div
          className="grid justify-center grid-cols-[repeat(auto-fill,208px)]"
          style={{ gap: "20px 6px" }}
        >
          {!similarLoading &&
            similarItems?.map((item) => (
              <div className="relative overflow-visible" key={item.id}>
                <RelatedItemCard item={item} />
              </div>
            ))}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 left-4 text-white p-2"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={30} />
          </button>

          <div
            className="relative flex items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()} // מונע סגירה כשמקליקים על התמונה
          >
            <button
              className="text-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronRight size={40} />
            </button>

            <img
              src={images[activeImage]}
              className="max-w-[80vw] max-h-[70vh] object-contain transition-opacity duration-300"
              onClick={(e) => e.stopPropagation()} // גם על התמונה עצמה
            />

            <button
              className="text-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronLeft size={40} />
            </button>
          </div>

          <div
            className="mt-4 w-[80vw] p-2 flex justify-center gap-2 overflow-x-auto rounded"
            onClick={(e) => e.stopPropagation()} // מונע סגירה כשמקליקים על preview
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(i);
                }}
                className={`w-16 h-16 object-cover rounded cursor-pointer border transition
            ${
              activeImage === i
                ? "ring-2 ring-red-500"
                : "opacity-70 hover:opacity-100"
            }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
