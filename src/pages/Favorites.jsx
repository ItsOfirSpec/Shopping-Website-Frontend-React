// src/pages/Favorites.jsx
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import ItemCard from "../components/ItemCard";

export default function Favorites() {
  const { user } = useContext(UserContext);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">פריטים מועדפים</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {user.favoriteItems.length === 0 ? (
          <p>אין פריטים מועדפים</p>
        ) : (
          user.favoriteItems.map((itemId) => (
            <ItemCard key={itemId} item={{ id: itemId, title: "פריט", photo: "/placeholder.png", price: 0, stock: 10 }} />
          ))
        )}
      </div>
    </div>
  );
}
