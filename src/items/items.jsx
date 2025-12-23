import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

export function generateFullImageUrls(imageList, categoryId, apiHost) {
  if (!Array.isArray(imageList)) return [];

  return imageList.map(filename => {
    const [itemIdFromFile, imageIdWithExt] = filename.split("_");
    const [imageId] = imageIdWithExt.split(".");
    return `${apiHost}/api/getitemimage/${categoryId}/${itemIdFromFile}/${imageId}`;
  });
}

export function useItemsByCategory(categoryId) {
  const { apiHost } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiHost}/api/items/category/${categoryId}`);

        if (!res.ok) throw new Error("Failed to fetch items");

        const data = await res.json();

        const processed = data.map(item => {
          let imageList = [];

          try {
            imageList = JSON.parse(item.images);
          } catch {
            console.warn("Invalid images format in item:", item.id);
          }

          const fullImages = generateFullImageUrls(imageList, categoryId, apiHost);

          return { ...item, images: fullImages };
        });

        setItems(processed);

      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    fetchItems();
  }, [categoryId, apiHost]);

  return { items, loading, error };
}

export function useItemsBySimilar(itemId) {
  const { apiHost } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiHost}/api/items/similar/${itemId}`);

        if (!res.ok) throw new Error("Failed to fetch similar items");

        const data = await res.json();

        const processed = data.map(item => {
          let imageList = [];

          try {
            imageList = JSON.parse(item.images);
          } catch {
            console.warn("Invalid images format in item:", item.id);
          }
          
          const fullImages = generateFullImageUrls(imageList, item.categoryid, apiHost);
          return { ...item, images: fullImages };
        });

        setItems(processed);

      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    fetchItems();
  }, [itemId, apiHost]);

  return { items, loading, error };
}

export function useRandomItems(maximum = 0) {
  const { apiHost } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiHost}/api/items`);
        if (!res.ok) throw new Error("Failed to fetch items");

        let data = await res.json();

        data = data.map(item => {
          let imageList = [];

          try {
            imageList = JSON.parse(item.images);
          } catch {
            console.warn("Invalid images format in item:", item.id);
          }
          const fullImages = generateFullImageUrls(imageList, item.categoryid, apiHost);

          return { ...item, images: fullImages };
        });

        const shuffled = data.sort(() => Math.random() - 0.5);
        if(maximum > 0) {
          setItems(shuffled.slice(0, maximum));
        } else {
          setItems(shuffled);
        }
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    fetchItems();
  }, [maximum, apiHost]);

  return { items, loading, error };
}

export function useItemById(itemId) {
  const { apiHost } = useContext(UserContext);
  const [idItem, setIdItem] = useState(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemError, setItemError] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      setItemLoading(true);
      setItemError(null);

      try {
        const res = await fetch(`${apiHost}/api/items/${itemId}`);

        if (!res.ok) throw new Error("Failed to fetch item");

        const data = await res.json();

        let imageList = [];
        try {
          imageList = JSON.parse(data.images);
        } catch {
          console.warn("Invalid images format in item:", data.id);
        }

        const fullImages = generateFullImageUrls(imageList, data.categoryid, apiHost);
        setIdItem({ ...data, images: fullImages });

      } catch (err) {
        setItemError(err.message);
      }

      setItemLoading(false);
    };

    fetchItem();
  }, [itemId, apiHost]);

  return { idItem, itemLoading, itemError };
}