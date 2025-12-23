import { useEffect, useState } from "react";

export default function SvgIcon({ url, size = "1em", color = "currentColor", fallback = null }) {
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;


    setSvgContent("");
    setError(false);

    const isExternal = /^https?:\/\//i.test(url);

    const fetchSvg = async () => {
      try {
        let svgText;
        if (isExternal) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`);
          svgText = await res.text();
        } else {
          const res = await fetch(url); 
          if (!res.ok) throw new Error(`Failed to load local SVG: ${res.status}`);
          svgText = await res.text();
        }
        const inner = svgText.replace(/<svg[^>]*>|<\/svg>/g, "");
        setSvgContent(inner);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchSvg();
  }, [url]);

  if (error) {
    return fallback ? fallback : <span style={{ display: "inline-block", width: size, height: size, background: "#eee" }} />;
  }

  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      fill={color}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
