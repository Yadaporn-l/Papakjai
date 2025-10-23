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


// VisaResult.js - เพิ่มฟังก์ชันนี้เข้าไปใน Component

  //... โค้ดฟังก์ชัน fetchFinancialInfo...

  // ฟังก์ชันใหม่สำหรับดึงข้อมูลคำแนะนำด้านสุขภาพ
  const fetchHealthAdvisory = async () => {
    try {
      // เรียก Backend Proxy ของเรา
      const res = await fetch(`http://localhost:4000/api/health-notices?country=${encodeURIComponent(country)}`);
      if (!res.ok) {
        throw new Error('Could not fetch health notices.');
      }
      const data = await res.json();
      
      // สร้าง JSX เพื่อแสดงผล
      return (
        <div>
          <h4>CDC Travel Health Notices</h4>
          <p>{data.recommendation}</p>
          <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
            <em>Source: U.S. Centers for Disease Control and Prevention. This is for reference only. Consult a healthcare professional before traveling.</em>
          </p>
        </div>
      );

    } catch (error) {
      console.error("Error fetching health advisory:", error);
      // ในกรณีที่เกิดข้อผิดพลาด ให้แสดงข้อความ default
      return (
        <div>
          <h4>Health Advisory</h4>
          <p>Could not load specific health notices. General advice: Ensure you have travel insurance and are up-to-date with routine vaccinations. Check with your doctor for country-specific recommendations.</p>
        </div>
      );
    }
  };

  //... โค้ดฟังก์ชันอื่นๆ