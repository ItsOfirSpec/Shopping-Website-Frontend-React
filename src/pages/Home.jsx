import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import ItemCard from "../components/ItemCard";
import Countdown from "../components/Countdown";
import DiscountButton from "../components/DiscountButton";
import { useRandomItems } from "../items/items";
import ColorSpinner from "../components/ColorSpinner";
import ScrollButtons from "../components/ScrollButtons";
import GlowCard from "../components/GlowCard";
import { shuffleArray } from "../utils/arrayUtils";
import { generateFullImageUrls } from "../items/items";
import "../styles/Home.css";

export default function Home() {
  const { user, apiHost } = useContext(UserContext);
  const { items, loading, error } = useRandomItems();

  const [cachedBigSavings, setCachedBigSavings] = useState([]);
  const [cachedSuperDeal, setCachedSuperDeal] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [batchScrollEnabled, setBatchScrollEnabled] = useState(false);
  const [fetchSimilarItems, setFetchSimilarItems] = useState(true);
  const displayCountRef = useRef(0);
  const loaderRef = useRef(null);
  const gridRef = useRef(null);
  const itemRef = useRef(null);
  const [batchSize, setBatchSize] = useState(6);

  const INITIAL_VISIBLE = 56;

  useEffect(() => {
    const savedSavings = localStorage.getItem("home-big-savings");
    const savedDeals = localStorage.getItem("home-super-deals");

    if (savedSavings && savedDeals) {
      setCachedBigSavings(JSON.parse(savedSavings));
      setCachedSuperDeal(JSON.parse(savedDeals));
    } else if (items.length > 0) {
      const sorted = [...items].sort((a, b) => {
        const aDiscount = ((a.originalPrice - a.price) / a.originalPrice) * 100;
        const bDiscount = ((b.originalPrice - b.price) / b.originalPrice) * 100;
        return bDiscount - aDiscount;
      });

      const bigSavings = sorted
        .filter((i) => i.discountpercent >= 80)
        .slice(0, 3);
      const superDeal = sorted
        .filter((i) => i.discountpercent < 80)
        .slice(0, 3);

      localStorage.setItem("home-big-savings", JSON.stringify(bigSavings));
      localStorage.setItem("home-super-deals", JSON.stringify(superDeal));

      setCachedBigSavings(bigSavings);
      setCachedSuperDeal(superDeal);
    }
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      displayCountRef.current = Math.min(INITIAL_VISIBLE, items.length);
      setDisplayItems(items.slice(0, displayCountRef.current));
    }
  }, [items]);

  useEffect(() => {
    if (!items.length) return;

    const computeBatchSize = () => {
      if (!gridRef.current || !itemRef.current) return;

      const gridWidth = gridRef.current.clientWidth;
      const itemWidth = itemRef.current.offsetWidth;

      const totalItemWidth = itemWidth;
      const itemsPerRow = Math.max(1, Math.floor(gridWidth / totalItemWidth));
      const rowsPerBatch = 3;

      const calc = itemsPerRow * rowsPerBatch;

      setBatchSize((prev) => (prev !== calc ? calc : prev));
    };

    computeBatchSize();

    const interval = setInterval(computeBatchSize, 400);
    return () => clearInterval(interval);
  }, [items]);

  useEffect(() => {
    if (!loaderRef.current) return;
    if (!batchScrollEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const next = Math.min(
            displayCountRef.current + batchSize,
            items.length
          );

          if (next > displayCountRef.current) {
            setDisplayItems(items.slice(0, next));
            displayCountRef.current = next;
          }
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [items, batchSize, batchScrollEnabled]);

  useEffect(() => {
    if (!user || !items.length || !fetchSimilarItems) return;
    setFetchSimilarItems(false);
    const fetchSimilar = async () => {
      try {
        let cartItems = [];

        if (!user.isLoggedIn) {
          const localUser = JSON.parse(localStorage.getItem("userData"));
          cartItems = localUser?.cartItems || [];
        } else {
          const res = await fetch(`${apiHost}/api/cart/user/${user.id}`, {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) return;

          const data = await res.json();
          cartItems = JSON.parse(data.message) || [];
        }

        if (!cartItems.length) return;

        const similarArrays = await Promise.all(
          cartItems.map(async (cartItem) => {
            try {
              const itemId = user.isLoggedIn ? cartItem.itemid : cartItem;
              const res = await fetch(`${apiHost}/api/items/similar/${itemId}`);

              if (!res.ok) return [];

              return await res.json();
            } catch {
              return [];
            }
          })
        );

        let similarItems = similarArrays.flat();
        similarItems = similarItems.map((item) => {
          const fullImages = generateFullImageUrls(
            JSON.parse(item.images),
            item.categoryid,
            apiHost
          );
          return { ...item, images: fullImages };
        });

        const uniqueMap = new Map();
        similarItems.forEach((item) => uniqueMap.set(item.id, item));
        similarItems = Array.from(uniqueMap.values());

        const existingIds = new Set(displayItems.map((i) => i.id));
        similarItems = similarItems.filter((i) => !existingIds.has(i.id));

        similarItems = shuffleArray(similarItems);

        if (similarItems.length > 0) {
          setDisplayItems((old) => [...similarItems, ...old]);
          displayCountRef.current += similarItems.length;
        }
      } catch (e) {
        console.error("Similar items error:", e);
      }
    };

    fetchSimilar();
  }, [user, items]);

  if (loading) return <ColorSpinner text="" color="#ff6b6b" />;
  if (error)
    return (
      <div className="error-box">
        <h2>שגיאה בטעינת הדף</h2>
        <p>אנא נסה שוב מאוחר יותר</p>
      </div>
    );

  return (
    <div className="p-4" dir="rtl">
      <h2
        style={{
          textAlign: "center",
          fontSize: "26px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        היום במבצעים
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "25px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <GlowCard
          style={{
            border: "1px solid #ccc",
            width: "42%",
            minWidth: "300px",
          }}
          variant="gray"
        >
          <h3
            style={{
              fontSize: "22px",
              marginBottom: "15px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            חוסכים בגדול
          </h3>
          <div className="flex justify-center items-center">
            <DiscountButton apiHost={apiHost} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "6px",
            }}
          >
            {cachedBigSavings.map((item) => (
              <ItemCard key={item.id} item={item} isExpanded={false} />
            ))}
          </div>
        </GlowCard>

        <GlowCard
          style={{
            border: "1px solid #ccc",
            width: "42%",
            minWidth: "300px",
          }}
          variant="gray"
        >
          <h3
            style={{
              fontSize: "22px",
              marginBottom: "8px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            סופר דיל
          </h3>

          <div className="flex justify-center items-center">
            <Countdown
              endTime={Date.now() + 1000 * 60 * 60 * 12}
              apiHost={apiHost}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "6px",
            }}
          >
            {cachedSuperDeal.map((item, index) => (
              <ItemCard key={item.id} item={item} isExpanded={false} />
            ))}
          </div>
        </GlowCard>
      </div>

      <h3
        style={{
          textAlign: "center",
          fontSize: "26px",
          fontWeight: "bold",
          marginBottom: "60px",
          marginTop: "30px",
        }}
      >
        מוצרים נוספים שאולי יעניינו אותך
      </h3>

      <div
        ref={gridRef}
        className="grid justify-center overflow-visible relative"
        style={{
          gridTemplateColumns: "repeat(auto-fill, 255px)",
          gap: "20px 6px",
        }}
      >
        {displayItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="relative overflow-visible"
            ref={index === 0 ? itemRef : null}
          >
            <ItemCard item={item} />
          </div>
        ))}
      </div>
      {!batchScrollEnabled && displayCountRef.current < items.length && (
        <div className="flex justify-center mt-20">
          <button
            onClick={() => setBatchScrollEnabled(true)}
            className="
        px-10 py-4 
        bg-gradient-to-r from-red-400 to-red-500 
        text-white text-lg font-semibold 
        rounded-3xl 
        shadow-md hover:shadow-xl
        hover:brightness-110
        active:scale-95
        transition-all duration-300 ease-out
      "
          >
            הצג עוד מוצרים
          </button>
        </div>
      )}

      {batchScrollEnabled && displayCountRef.current < items.length && (
        <div ref={loaderRef} style={{ height: "1px" }}></div>
      )}
      <ScrollButtons
        batchScrollEnabled={batchScrollEnabled}
        setBatchScrollEnabled={setBatchScrollEnabled}
      />
    </div>
  );
}
