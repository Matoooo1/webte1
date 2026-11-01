// every parser return day, and items - heading, price, desc


function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function textOf(element, selector) {
  return cleanText(
      element.querySelector(selector)?.textContent ?? ""
  );
}

function parsePrice(text) {
  if (!text) return null;

  const match = text.match(/\d+(?:[,.]\d{1,2})?/);

  if (!match) return null;

  const price = Number(match[0].replace(",", "."));

  return Number.isNaN(price) ? null : price;
}

function parseHtml(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

function parseEATMEET(doc) {
  const days = [];

  for (const MENU of doc.querySelectorAll(".tab-pane")) {
    const items = [];

    for (const ITEM of MENU.querySelectorAll(".menu-body")) {
      const heading = textOf(ITEM, "h4");
      const price = parsePrice(textOf(ITEM, ".price"));
      const desc = textOf(ITEM, ".desc");

      if (!heading && !desc) continue;

      items.push({
        heading,
        price,
        desc,
      });
    }

    days.push({
      day: MENU.id,
      items,
    });
  }

  return days;
}

function parseDRUZBA(doc) {
  const days = [];

  const headings = doc.querySelectorAll(".heading-title h2");

  for (const heading of headings) {
    const dayName = heading.textContent.trim();

    let table = heading.parentElement.nextElementSibling;

    while (table && table.tagName !== "TABLE") {
      table = table.nextElementSibling;
    }

    if (!table) continue;

    const items = [];
    const rows = table.querySelectorAll("tr");

    for (const row of rows) {
      const cells = row.querySelectorAll("td, th");

      if (cells.length < 2) continue;
      const headingText = cleanText(cells[0].innerText);
      const priceText = cleanText(cells[1].innerText);
      if (
          !headingText ||
          /^názov$/i.test(headingText) ||
          /^cena$/i.test(priceText)
      ) {
        continue;
      }

      items.push({
        heading: headingText,
        price: parseDruzbaPrice(priceText),
        priceText: priceText.toLowerCase().includes("v cene menu")
            ? "V cene menu"
            : "",
        desc: ""
      });
    }

    days.push({
      day: dayName,
      items
    });
  }

  return days;
}


function parseDRAG(doc) {
  const days = [];

  for (const pane of doc.querySelectorAll(".tab-pane")) {
    const dayId = pane.id;
    if (!dayId) continue;

    const dayName =
        pane.querySelector(".menu_box_title h2")?.textContent.trim()
        || dayId;

    const items = [];

    // soup is out of the normal structure
    const headings = [...pane.querySelectorAll(".menu_box_title h3")];
    const soupHeading = headings.find(h =>
        h.textContent.trim().toUpperCase().includes("POLIEVKA")
    );

    if (soupHeading) {
      const soupText = [];

      // soup name is between POLIEVKA and next HLAVNE JEDLO
      for (
          let node = soupHeading.parentElement.nextSibling;
          node;
          node = node.nextSibling
      ) {
        if (
            node.nodeType === 1 &&
            node.matches(".menu_box_title")
        ) {
          break;
        }

        if (node.nodeType === 3) {
          soupText.push(node.textContent);
        } else if (node.nodeType === 1) {
          soupText.push(node.textContent);
        }
      }
      const soup = cleanText(soupText.join(" "));

      if (soup) {
        items.push({
          heading: "Polievka",
          desc: soup,
          price: null,
          priceText: "V cene menu"
        });
      }
    }

    // table content
    for (const row of pane.querySelectorAll("table tr")) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) continue;

      const name = cleanText(cells[0].textContent);
      const priceText = cleanText(cells[1].textContent);


      if (!name || !priceText) continue;

      items.push({
        heading: name,
        desc: "",
        price: parsePrice(priceText),
        priceText
      });
    }

    days.push({
      day: dayId,
      dayName,
      items
    });
  }

  return days;
}
function parseDruzbaPrice(text) {
  const matches = [...text.matchAll(/(\d+[,.]\d{2})\s*€/g)];

  if (!matches.length) return null;

  // price
  const value = matches.length > 1
      ? matches[1][1]
      : matches[0][1];

  return Number(value.replace(",", "."));
}
