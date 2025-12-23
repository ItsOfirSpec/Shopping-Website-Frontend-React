export const exchangeRates = {
  ILS: 1,  
  USD: 0.27,
  EUR: 0.25,
  GBP: 0.21,
  JPY: 39.5,
  CAD: 0.36,
};

export const currencySymbols = {
  ILS: "₪",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "$",
};
export function formatPriceNum(priceILS) {
  if(!priceILS) priceILS = 0;
  const currency = localStorage.getItem("preferredCurrency") || "ILS";
  const rate = exchangeRates[currency] ?? 1;
  return priceILS * rate;
}

export function formatPrice(priceILS) {
  if(!priceILS) priceILS = 0;
  const currency = localStorage.getItem("preferredCurrency") || "ILS";
  const symbol = currencySymbols[currency];
    const formattedNumber = Number(formatPriceNum(priceILS)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formattedNumber} ${symbol}`;
}

