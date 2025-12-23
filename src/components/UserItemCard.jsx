import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { removeByValue } from "../utils/arrayUtils";

export default function UserItemCard({ itemId, quantity: initialQuantity, onQuantityChange }) {
  const { user, updateUser, apiHost, addToCart, updateCartItem, deleteCartItem } = useContext(UserContext);

  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity || 1);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${apiHost}/api/items/${itemId}`);
        if (!res.ok) return;
        let data = await res.json();
        let imageList = [];
        try { imageList = JSON.parse(data.images || "[]"); } catch {}
        const fullImages = imageList.map(filename => {
          const [itemId, imageIdWithExt] = filename.split("_");
          const [imageId] = imageIdWithExt.split(".");
          return `${apiHost}/api/getitemimage/${data.categoryid}/${itemId}/${imageId}`;
        });
        setItem({ ...data, images: fullImages });
      } catch (err) {
        console.error(err);
      }
    };
    fetchItem();
  }, [itemId, apiHost]);

  const handleQuantityChange = async (delta) => {
    if (!item || item.stock === 0) return;
    let newQuantity = quantity + delta;
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > item.stock) newQuantity = item.stock;

    setQuantity(newQuantity);

    if (user.isLoggedIn) {
      const existingInCart = user.cartitems.includes(item.id);
      if (!existingInCart) {
        user.cartitems.push(item.id);
        await addToCart({ id: item.id, userid: user.id, itemid: item.id, quantity: newQuantity });
      } else {
        await updateCartItem(item.id, { id: item.id, userid: user.id, itemid: item.id, quantity: newQuantity });
      }
    }

    updateUser();
    onQuantityChange && onQuantityChange(newQuantity);
  };

  const handleRemove = async () => {
    if (!item) return;

    if (user.isLoggedIn && user.cartitems.includes(item.id)) {
      try {
        await deleteCartItem(item.id);
      } catch {}
    }
    user.cartitems = removeByValue(user.cartitems, item.id);
    setQuantity(0);
    updateUser();
    onQuantityChange && onQuantityChange(0);
  };

  if (!item) return null;

  const totalPrice = (item.price || 0) * quantity;
  const isOutOfStock = item.stock === 0;

  return (
    <div className="flex gap-4 border-b py-4 items-center text-right">
      <div className="w-24 h-24 flex-shrink-0">
        <img src={item.images[0] || ""} alt={item.title} className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-600 text-sm">₪{item.price?.toFixed(2)} ליחידה</span>
          <span className="font-bold text-black text-lg">סה"כ: ₪{totalPrice.toFixed(2)}</span>
          {isOutOfStock && <span className="text-red-500 font-semibold">אזל מהמלאי</span>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="bg-gray-300 px-2 rounded hover:bg-gray-400 transition"
            disabled={isOutOfStock || quantity <= 1}
          >
            -
          </button>
          <span className="px-2">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="bg-gray-300 px-2 rounded hover:bg-gray-400 transition"
            disabled={isOutOfStock || quantity >= item.stock}
          >
            +
          </button>
          <span className="text-gray-500 text-sm">מלאי: {item.stock}</span>
          <button
            onClick={handleRemove}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
          >
            הסר מהסל
          </button>
        </div>
      </div>
    </div>
  );
}
