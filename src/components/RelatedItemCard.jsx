import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { formatPrice } from "../utils/currency";
import SvgIcon from "./SvgIcon";

export default function RelatedItemCard({ item, isExpanded = true }) {
  const navigate = useNavigate();
  const { user, apiHost, updateUser, isDivDisabled, toggleCart } = useContext(UserContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cartHovered, setCartHovered] = useState(false);
  const [cartAdded, setCartAdded] = useState(
    user?.cartItems?.includes(item.id) || false
  );

  const containerRef = useRef(null);
  const images = Array.isArray(item.images)
    ? item.images
    : JSON.parse(item.images || "[]");
  const rating = Math.round(item?.stars || item?.rating || 0);
  const originalPrice = item.discountpercent
    ? item.price / (1 - item.discountpercent / 100)
    : null;

  useEffect(() => {
    const handleCartChanged = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      setCartAdded(userData?.cartItems?.includes(item.id));
    };
    window.addEventListener("cartChanged", handleCartChanged);
    return () => window.removeEventListener("cartChanged", handleCartChanged);
  }, []);

  const handleMouseMove = (e) => {
    if (images.length <= 1) return;
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const handleItemClick = (e,action,preventdefault) => {
      if(preventdefault) e.preventDefault();
      e.stopPropagation();
      navigate(`/${action}/${item.id}`);
      scrollToTop();
  }
  return (
    <div
      className="w-[202px] h-[307px] bg-white rounded-xl shadow-md overflow-hidden relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ overflow: "visible" }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-[202px] flex items-center justify-center bg-gray-100"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "visible",
        }}
        onMouseMove={handleMouseMove}
        onClick={() => {
          navigate(`/item/${item.id}`);
          scrollToTop();
        }}
      >
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
            dir="ltr"
          >
            {images.map((_, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`w-2.5 h-2.5 rounded-full border ${
                  i === currentIndex
                    ? "bg-red-600 border-red-600"
                    : "bg-gray-200 border-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        <div
          className="absolute top-2 right-2 text-xl"
          onClick={(e) => {
            e.stopPropagation();
            const favorites = user.favoriteItems || [];
            if (favorites.includes(item.id)) {
              updateUser(
                "favoriteItems",
                favorites.filter((id) => id !== item.id)
              );
            } else {
              updateUser("favoriteItems", [...favorites, item.id]);
            }
          }}
        >
          {user.favoriteItems.includes(item.id) ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-600 hover:text-red-400" />
          )}
        </div>

        <div
          style={{
            width: "32px",
            height: "32px",
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
            bottom: "8px",
            right: "8px",
            cursor: "pointer",
          }}
          onMouseEnter={() => setCartHovered(true)}
          onMouseLeave={() => setCartHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDivDisabled(e.currentTarget)) toggleCart(item);
          }}
        >
          <SvgIcon
            url={`${apiHost}/api/geticonimage/cart/svg`}
            size="1em"
            color={cartHovered || cartAdded ? "#fff" : "#000"}
          />
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1 relative">
        <div
          className="text-sm font-semibold line-clamp-2"
          style={{cursor: "pointer"}}
        >
            <a 
              href={`/item/${item.id}`}
              onClick={(e) => { handleItemClick(e, "item", true) }}>
               {item.title || "אין תיאור זמין."}
            </a>
        </div>
        <div className="flex gap-1">{renderStars()}</div>
        <div className="flex items-center gap-1">
          <span className="text-red-600 font-bold">
            {formatPrice(item.price)}
          </span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-xs">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "-70px",
            left: 0,
            width: "100%",
            height: "76px",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "stretch",
            padding: "4px",
            gap: "4px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
            clipPath: "inset(0px -6px -6px -6px)",
            opacity: hovered && isExpanded ? 1 : 0,
            transform:
              hovered && isExpanded ? "translateY(0)" : "translateY(6px)",
            pointerEvents: hovered && isExpanded ? "auto" : "none",
            zIndex: 1000,
          }}
        >
          <button
            className="w-full py-1 bg-black text-white font-bold rounded hover:bg-gray-800"
            onClick={(e) => {
              handleItemClick(e, "item", false) 
            }}
          >
            <a 
              href={`/item/${item.id}`}
              onClick={(e) => { handleItemClick(e, "item", true) }}>
               תצוגה מקדימה
            </a>
    
          </button>
          <button
            className="w-full py-1 bg-white text-black border border-black font-bold rounded hover:bg-gray-100"
            onClick={(e) => {
              handleItemClick(e, "similar", false) 
            }}
          >
            <a 
              href={`/similar/${item.id}`}
              onClick={(e) => { handleItemClick(e, "similar", true) }}>
               פריטים דומים
            </a>
          </button>
        </div>
      </div>
    </div>
  );
}
