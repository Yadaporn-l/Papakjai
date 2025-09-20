async function loadCountries() {
  try {
    // เพิ่ม fields เพื่อให้ API return เฉพาะข้อมูลที่เราต้องการ
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,region");
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return;
    }

    const select = document.getElementById("country");
    select.innerHTML = '<option value="">-- Select a country --</option>';

    data.sort((a, b) => a.name.common.localeCompare(b.name.common));

    data.forEach(country => {
      const option = document.createElement("option");
      option.value = country.name.common.toLowerCase();
      option.textContent = country.name.common;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading countries:", error);
  }
}
