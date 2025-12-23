import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { formatPrice } from "../utils/currency";
import SvgIcon from "./SvgIcon";

export default function ItemCard({ item, isExpanded = true }) {
  const navigate = useNavigate();
  const { user, apiHost, updateUser, toggleCart, isDivDisabled } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cartHovered, setCartHovered] = useState(false);
  const [cartAdded, setCartAdded] = useState(
    user?.cartItems?.includes(item.id) || false
  );
  const [isVisible, setIsVisible] = useState(false);
  const [currencyTrigger, setCurrencyTrigger] = useState(
    localStorage.getItem("preferredCurrency") || "ILS"
  );

  const containerRef = useRef(null);
  const images = Array.isArray(item.images)
    ? item.images
    : JSON.parse(item.images || "[]");

  const rating = Math.round(item?.stars || item?.rating || 0);

  const calculateOriginalPrice = (discountedPrice, discountPercent) => {
    if (!discountPercent) return null;
    return discountedPrice / (1 - discountPercent / 100);
  };

  const originalPrice = calculateOriginalPrice(
    item.price,
    item.discountpercent
  );
  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrencyTrigger(localStorage.getItem("preferredCurrency") || "ILS");
    };
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || images.length === 0) return;
    images.forEach((src) => (new Image().src = src));
  }, [isVisible, images]);

  const handleMouseMove = (e) => {
    if (!hovered || images.length <= 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    let index = Math.floor(percent * images.length);
    if (index < 0) index = 0;
    if (index > images.length - 1) index = images.length - 1;
    if (index !== currentIndex) setCurrentIndex(index);
  };

  const renderStars = () =>
    [...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="text-black text-sm" />
      ) : (
        <FaRegStar key={i} className="text-black text-sm" />
      )
    );

  const toggleFavorite = (itemId) => {
    const favorites = user.favoriteItems || [];
    if (favorites.includes(itemId)) {
      updateUser(
        "favoriteItems",
        favorites.filter((id) => id !== itemId)
      );
    } else {
      updateUser("favoriteItems", [...favorites, itemId]);
    }
  };
  useEffect(() => {
    const handleCartChanged = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      setCartAdded(userData?.cartItems?.includes(item.id));
    };
    window.addEventListener("cartChanged", handleCartChanged);
    return () => {
      window.removeEventListener("cartChanged", handleCartChanged);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div
      key={item.id}
      style={{
        boxShadow:
          hovered && isExpanded ? "0 0 6px rgba(0, 0, 0, 0.3)" : "none",
      }}
    >
      <div
        className="w-full bg-white rounded-t-xl pb-4 cursor-pointer select-none relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ padding: "16px", overflow: "visible" }}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full h-[255px] overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: `url(${images[currentIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflow: "visible",
          }}
        >
          {user?.isLoggedIn && (
            <div
              className="absolute top-2 right-2 text-xl cursor-pointer"
              onClick={() => toggleFavorite(item.id)}
            >
              {user.favoriteItems.includes(item.id) ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-600 hover:text-red-400" />
              )}
            </div>
          )}

          <div
            style={{
              width: "40px",
              height: "40px",
              border:
                cartHovered || cartAdded
                  ? "1px solid #3a3a3aff"
                  : "1px solid rgba(0,0,0,.4)",
              borderRadius: "24px",
              backgroundColor: cartHovered || cartAdded ? "#000" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: "20px",
              right: "10px",
              cursor: "pointer",
            }}
            onMouseEnter={() => setCartHovered(true)}
            onMouseLeave={() => setCartHovered(false)}
            onClick={(e) =>
              !isDivDisabled(e.currentTarget) &&
              toggleCart(item, e.currentTarget)
            }
          >
            <SvgIcon
              url={`${apiHost}/api/geticonimage/cart/svg`}
              size="1.4em"
              color={cartHovered || cartAdded ? "#fff" : "#000"}
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-2 right-3 flex gap-[6px]" dir="ltr">
              {images.map((_, i) => (
                <div
                  style={{ border: "1px solid #a5a5a5ff" }}
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                    currentIndex === i ? "bg-black" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "-56px",
            left: 0,
            width: "100%",
            height: "56px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            gap: "12px",
            boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
            clipPath: "inset(0px -6px -6px -6px)",
            opacity: hovered && isExpanded ? 1 : 0,
            transform:
              hovered && isExpanded ? "translateY(0)" : "translateY(6px)",
            pointerEvents: hovered && isExpanded ? "auto" : "none",
            zIndex: 1000,
          }}
        >
          <button
            style={{
              flex: 1,
              height: "30px",
              background: "#000",
              color: "#fff",
              fontSize: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
            href={`/item/${item.id}`}
            onClick={(e) => { e.preventDefault(); navigate(`/item/${item.id}`); scrollToTop(); } }
            >
             תצוגה מקדימה  
            </a>
          </button>

          <button
            style={{
              flex: 1,
              height: "30px",
              border: "1px solid #000",
              fontSize: "14px",
              background: "#fff",
              color: "#000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
            href={`/similar/${item.id}`}
            onClick={(e) => { e.preventDefault(); navigate(`/similar/${item.id}`); scrollToTop(); } }
            >
             פריטים דומים
            </a>
          </button>
        </div>
        {/* -------------------------------------------- */}

        <div className="px-3 flex flex-col gap-1 mt-2">
          <div
            className="text-sm text-gray-900 line-clamp-2 h-9 leading-tight font-semibold"
            style={{ direction: "rtl" }}
          >
            <a
            href={`/item/${item.id}`}
            onClick={(e) => { e.preventDefault(); navigate(`/item/${item.id}`); scrollToTop(); } }
            >
              {item.title}
            </a>
          </div>

          <div className="flex items-center gap-1">{renderStars()}</div>

          <div className="flex items-center gap-2">
            <span className="text-lg text-black font-semibold">
              {formatPrice(item.price)}
            </span>
            {originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {item.discountpercent && (
              <div style={{ backgroundColor: "#ed383f" }} dir="ltr">
                <span
                  className="text-white font-semibold text-sm"
                  style={{ padding: "10px" }}
                >
                  -{item.discountpercent}%
                </span>
              </div>
            )}
            <div className="text-gray-600 text-sm">{item.sold || 0} נמכרו</div>
          </div>
        </div>
      </div>
    </div>
  );
}
