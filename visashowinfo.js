    const items = document.querySelectorAll(".accordion-item");
    items.forEach((item, index) => {
      item.addEventListener("click", () => {
        const content = item.nextElementSibling;
        content.style.display =
          content.style.display === "block" ? "none" : "block";
      });
    });