import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { tags, searchTags } from "../items/search";
import { generateFullImageUrls } from "../items/items"; 

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const apiHost = "http://192.168.1.109:8080";

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiHost}/api/items/search/?title=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();

        const items = data.map(item => {
          const images = JSON.parse(item.images || "[]");
          const fullImages = generateFullImageUrls(images, item.categoryid, apiHost);
          return { ...item, fullImages };
        });

        const tagResults = searchTags(query).map(tag => ({
          ...tag,
          isTag: true
        }));

        setResults([...tagResults, ...items]);
      } catch (e) {
        setResults(
          searchTags(query).map(tag => ({ ...tag, isTag: true }))
        );
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchResults, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = item => {
    setFocused(false);
    setResults([]);
    setQuery("");

    if (item.isTag) {
      navigate(`/category/${item.categoryId}`);
    } else {
      navigate(`/item/${item.id}`);
    }
  };

  return (
    <div className="relative w-11/12 md:w-3/4 lg:w-2/3 mx-auto" dir="rtl">
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="w-full py-3 pr-12 pl-4 text-sm border rounded-xl transition"
          placeholder="חפש מוצרים..."
        />
        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {focused && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border max-h-96 overflow-auto">
          {results.map((item, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(item)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50 transition border-b last:border-b-0"
            >
              {item.isTag ? (
                <img
                  src={`/categories/${item.categoryId}.avif`}
                  className="w-12 h-12 rounded-lg bg-gray-100 p-1"
                  alt=""
                />
              ) : (
                item.fullImages?.[0] && (
                  <img
                    src={item.fullImages[0]}
                    className="w-12 h-12 rounded-lg object-cover"
                    alt=""
                  />
                )
              )}

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {item.title || item.name}
                </span>

                {item.isTag ? (
                  <span className="text-xs text-red-500">
                    מעבר לקטגוריה
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">
                    ₪ {item.price}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {focused && loading && (
        <div className="absolute mt-2 w-full bg-white rounded-xl shadow px-4 py-3 text-sm text-gray-500">
          טוען תוצאות...
        </div>
      )}
    </div>
  );
}
