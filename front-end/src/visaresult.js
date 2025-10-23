const API_KEY = "e4699491c5-a4c761eb38-t4k1jg";
const fromCurrency = "USD";
const toCurrency = "EUR";

async function getExchangeRate() {
  try {
    const res = await fetch(`https://api.fastforex.io/fetch-one?from=${fromCurrency}&to=${toCurrency}&api_key=${API_KEY}`);
    if (!res.ok) throw new Error("Failed to fetch exchange rate");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

getExchangeRate();


