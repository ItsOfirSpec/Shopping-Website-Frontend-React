import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import categories from "../categories/categories";
import ItemCard from "../components/ItemCard";
import { useItemsByCategory } from "../items/items";
import ErrorPage from "../components/ErrorPage";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import ColorSpinner from "../components/ColorSpinner";

export default function Category() {
  const { id } = useParams();
  const categoryId = parseInt(id, 10);
  const { items, loading, error } = useItemsByCategory(categoryId);
  const category = categories.find((c) => c.id === categoryId);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSort = searchParams.get("sort") || null;
  const initialSortPrice = searchParams.get("order") || "asc";

  const [activeSort, setActiveSort] = useState(initialSort);
  const [sortPrice, setSortPrice] = useState(initialSortPrice);

  useEffect(() => {
    if (activeSort) {
      const params = {};
      params.sort = activeSort;
      if (activeSort === "price") params.order = sortPrice;
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  }, [activeSort, sortPrice, setSearchParams]);

  const handleSortPrice = () => {
    setActiveSort("price");
    setSortPrice((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSortSold = () => {
    setActiveSort("sold");
  };

  const handleSortDiscount = () => {
    setActiveSort("discount");
  };

  const sortedItems = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    if (activeSort === "price") {
      result.sort((a, b) =>
        sortPrice === "asc"
          ? (a.price || 0) - (b.price || 0)
          : (b.price || 0) - (a.price || 0)
      );
    } else if (activeSort === "sold") {
      result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (activeSort === "discount") {
      result.sort(
        (a, b) => (b.discountpercent || 0) - (a.discountpercent || 0)
      );
    }

    return result;
  }, [items, activeSort, sortPrice]);

  if (!category) {
    return (
      <ErrorPage
        status={404}
        message="הקטגוריה שחיפשת לא קיימת."
        actionText="חזור לדף הראשי"
        actionLink="/"
      />
    );
  }

  if (loading) return (
    <ColorSpinner text="" randomColor />
  );

  if (error)
    return (
      <ErrorPage
        status={500}
        message="שגיאה בטעינת המוצרים"
        details={error}
        actionText="חזור למסך הראשי"
        actionLink="/"
      />
    );

  return (
    <div className="p-4 rtl" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      <div className="mb-6 flex items-center overflow-visible ">
        <span className="font-semibold ml-4">מיין לפי :</span>

        <div className="flex">
          <button
            onClick={handleSortPrice}
            className={`px-3 h-8 border border-gray-300 flex items-center justify-center rounded-r transition-all duration-200 ease-in-out flex-none ${
              activeSort === "price"
                ? "border-black bg-gray-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span>מחיר</span>
            <div className="flex flex-col ml-1">
              <FaArrowUp
                className={`transition-colors duration-300 ${
                  activeSort === "price" && sortPrice === "asc"
                    ? "text-black"
                    : "text-gray-400"
                }`}
              />
              <FaArrowDown
                className={`transition-colors duration-300 ${
                  activeSort === "price" && sortPrice === "desc"
                    ? "text-black"
                    : "text-gray-400"
                }`}
              />
            </div>
          </button>

          <button
            onClick={handleSortSold}
            className={`px-3 h-8 border border-gray-300 border-l-0 border-r-0 flex items-center justify-center transition-all duration-200 ease-in-out flex-none ${
              activeSort === "sold"
                ? "border-black bg-gray-100"
                : "hover:bg-gray-50"
            }`}
          >
            נמכרו
          </button>

          <button
            onClick={handleSortDiscount}
            className={`px-3 h-8 border border-gray-300 border-l-1 flex items-center justify-center rounded-l transition-all duration-200 ease-in-out flex-none ${
              activeSort === "discount"
                ? "border-black bg-gray-100"
                : "hover:bg-gray-50"
            }`}
          >
            במצבע
          </button>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">אין מוצרים להציג.</div>
      ) : (
        <div
          className="grid justify-center"
          style={{
            gridTemplateColumns: "repeat(auto-fill, 258px)",
            gap: "15px",
          }}
        >
          {sortedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
