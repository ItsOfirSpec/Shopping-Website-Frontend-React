import { useState, useEffect, useRef, useContext } from "react";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { UserContext } from "../context/UserContext";
import { formatPrice } from "../utils/currency";
import { useNavigate } from "react-router-dom";

export default function FloatingCart() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [cartItemsData, setCartItemsData] = useState({});
  const { user, apiHost, deleteCartItem } = useContext(UserContext);
  const cartRef = useRef(null);

  const removeFromCart = (id) => {
    deleteCartItem(cartItemsData[id], null);
    setCartItemsData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
    window.dispatchEvent(new Event("cartChanged"));
  };

  useEffect(() => {
    if (!user?.cartItems?.length) return;

    user.cartItems.forEach((itemId) => {
      if (!cartItemsData[itemId]) {
        fetch(`${apiHost}/api/items/${itemId}`)
          .then((res) => res.json())
          .then((item) => {
            let imageList = [];
            try {
              imageList = JSON.parse(item.images);
            } catch {
              console.warn("Invalid images format in item:", item.id);
            }

            const fullImages = imageList.map((filename) => {
              const [itemIdPart, imageIdWithExt] = filename.split("_");
              const [imageId] = imageIdWithExt.split(".");
              return `${apiHost}/api/getitemimage/${item.categoryid}/${itemIdPart}/${imageId}`;
            });

            setCartItemsData((prev) => ({
              ...prev,
              [itemId]: { ...item, images: fullImages },
            }));
          })
          .catch((err) => console.error("Failed to load item:", err));
      }
    });
  }, [user.cartItems, cartItemsData, apiHost]);

  if (!user?.cartItems?.length) return null;

  const cartData = JSON.parse(localStorage.getItem("cartData") || "[]");
  const getItemQuantity = (itemId) => {
    const cartItem = cartData.find((x) => x.itemid === itemId);
    return cartItem ? Math.max(cartItem.quantity, 1) : 1;
  };

  const totalPrice = user.cartItems.reduce((sum, itemId) => {
    const item = cartItemsData[itemId];
    const quantity = getItemQuantity(itemId);
    return sum + (item?.price || 0) * quantity;
  }, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div
      ref={cartRef}
      className="fixed right-6 bottom-20 flex flex-col items-end z-[9999]"
      dir="rtl"
    >
      <div className="relative">
        <div
          onClick={() =>  setHovered(!hovered)}
          className="w-16 h-16 rounded-full bg-red-500 text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
        >
          <FaShoppingCart className="text-2xl" />
          <span className="absolute -top-2 -right-2 bg-white text-red-500 text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {user.cartItems.length}
          </span>
        </div>

        {/* Cart Dropdown */}
        <div
          className={`
            mt-2 w-80 max-h-96 bg-white shadow-2xl rounded-2xl overflow-y-auto
            transform transition-all duration-300
            origin-bottom-right
            ${hovered ? "translate-y-0 opacity-100 block" : "translate-y-4 opacity-0 hidden"}
            absolute bottom-full right-0 mb-2
          `}
        >
          <div className="flex flex-col p-4 gap-3">
            {user.cartItems.map((itemId, index) => {
              const item = cartItemsData[itemId];
              if (!item)
                return (
                  <div key={itemId} className="text-center text-gray-400 py-2">
                    טוען...
                  </div>
                );

              const quantity = getItemQuantity(item.id);
              const subtotal = quantity * (item.price || 0);
              const bg = index % 2 === 0 ? "bg-gray-50" : "bg-white";

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 p-2 rounded-lg ${bg} shadow-sm`}
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 flex flex-col justify-center truncate">
                    <a
                      href={`/item/${item.id}`}
                      className="font-semibold text-base truncate cursor-pointer hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/item/${item.id}`);
                        scrollToTop();
                      }}
                    >
                      {item.title.length > 40
                        ? item.title.substring(0, 40) + "…"
                        : item.title}
                    </a>
                    <div className="text-gray-700 text-sm mt-1">
                      {formatPrice(item.price)} ליחידה
                    </div>
                    <div className="text-gray-700 text-sm mt-0.5">
                      כמות: {quantity} {quantity > 1 && `— סה"כ: ${formatPrice(subtotal)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded"
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}

            {/* Total & Checkout */}
            <div className="mt-3 border-t pt-3 flex flex-col gap-2">
              <div className="flex justify-between font-semibold text-gray-800 text-base">
                <span>סה"כ הכל:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <button 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all"
                onClick={() => {setHovered(false); navigate("/cart")}}>
                תשלום בקופה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
