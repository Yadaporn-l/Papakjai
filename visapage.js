    function checkVisa() {
      const country = document.getElementById("country").value;
      const days = document.getElementById("days").value;
      let result = "";

      if (!country || !days) {
        result = "⚠️ Please select a country and length of stay.";
      } else {
        // กำหนดประเทศที่ไม่ต้องขอวีซ่า
        const noVisaCountries = ["japan", "thailand", "southkorea", "usa"];

        if (noVisaCountries.includes(country)) {
          result = Travelers from ${country.toUpperCase()} do NOT need a visa for ${days} days stay.;
        } else {
          result = Travelers from ${country.toUpperCase()} MUST apply for a visa.;
        }
      }

      document.getElementById("result").innerText = result;
    }