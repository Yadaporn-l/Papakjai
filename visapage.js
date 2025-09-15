async function loadCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const data = await response.json();
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

window.onload = loadCountries;
