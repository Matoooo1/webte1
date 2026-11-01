$("#delete").on("click", function () {
    localStorage.clear();
    $(this).text("Údaje vymazané");
});

const SOURCES = [
    {
        id: "eatmeet",
        name: "Eat & Meet",
        localUrl: "source/eatandmeet.html",
        Url: "https://eatandmeet.sk/",
        parse: parseEATMEET,
    },
    {
      id: "druzba",
      name: "Jedáleň Družba",
      localUrl: "source/druzba.html",
      Url: "https://www.druzbacatering.sk/obedove-menu/",
      parse: parseDRUZBA,
    },
    {
        id: "drag",
        name: "Reštaurácia DRAG",
        localUrl: "source/restauracia-drag.html",
        Url: "https://www.restauracia-drag.sk/restauracia-drag",
        parse: parseDRAG,
    },
];

const statusText = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const cards = document.getElementById("cards");

const results = {};
const selectedDays = {};
const visibleSources = {};


function saveMenu(sourceId, days) {
    const data = {savedAt: new Date().toISOString(), days};
    localStorage.setItem(`MENU_${sourceId}`, JSON.stringify(data));
}

function loadSavedMenu(sourceId) {
    const stored = localStorage.getItem(`MENU_${sourceId}`);

    if (!stored) {
        return null;
    }

    try {
        const data = JSON.parse(stored);
        const savedAt = new Date(data.savedAt);

        if (Number.isNaN(savedAt.getTime()) || savedAt.toDateString() !== new Date().toDateString() || !Array.isArray(data.days)) {
            return null;
        }

        return {
            savedAt,
            days: data.days
        };
    } catch (error) {
        console.error("Chyba pri čítaní uloženého menu:", error);
        return null;
    }
}

function getDayLabel(dayId) {
    const names = {
        pondelok: "Pondelok",
        utorok: "Utorok",
        streda: "Streda",
        stvrtok: "Štvrtok",
        piatok: "Piatok",
        sobota: "Sobota",
        nedela: "Nedeľa"
    };

    const match = String(dayId).match(/^day-(\d+)$/);

    const dayNames = [
        "Pondelok",
        "Utorok",
        "Streda",
        "Štvrtok",
        "Piatok",
        "Sobota",
        "Nedeľa"
    ];

    if (match) {
        return dayNames[Number(match[1]) - 1] ?? dayId;
    }

    return names[dayId.toLowerCase()] ?? dayId;
}

async function loadSource(source) {
    const response = await fetch(source.localUrl);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const doc = parseHtml(html);

    return source.parse(doc);
}

function createDayMenu(source, days) {
    const container = document.createElement("div");

    const select = document.createElement("select");
    select.className = "form-select mb-3";
    select.setAttribute("aria-label", `Vyber deň: ${source.name}`);
    const weekOption = document.createElement("option");
    weekOption.value = "all";
    weekOption.textContent = "Celý týždeň";
    select.append(weekOption);

    for (const day of days) {
        const option = document.createElement("option");
        option.value = day.day;
        option.textContent = getDayLabel(day.day);
        select.append(option);
    }

    const savedDay = selectedDays[source.id];

    if (savedDay === "all" || days.some(day => day.day === savedDay)) {
        select.value = savedDay;
    }
    else if (days.length) {
        // day to number
        const todayNumber = new Date().getDay() || 7;

        // Eat & Meet uses day-1 day-2...
        const todayId = `day-${todayNumber}`;

        // for other resteurants
        const todayNames = [
            "",
            "pondelok",
            "utorok",
            "streda",
            "štvrtok",
            "piatok",
            "sobota",
            "nedeľa"
        ];

        const today = days.find(day => {
            const value = day.day.toLowerCase();

            return value === todayId ||
                value.startsWith(todayNames[todayNumber]);
        });

        select.value = today ? today.day : days[0].day;
    }

    selectedDays[source.id] = select.value;

    const list = document.createElement("div");

    function renderDay() {
        selectedDays[source.id] = select.value;
        list.replaceChildren();

        // whole week
        const daysToShow = select.value === "all"
            ? days
            : days.filter(day => day.day === select.value);

        for (const day of daysToShow) {
            const dayHeading = document.createElement("h3");
            dayHeading.className = "h5 fw-bold mt-3 mb-3";
            dayHeading.textContent = getDayLabel(day.day);

            list.append(dayHeading);

            if (day.items.length === 0) {
                const empty = document.createElement("p");
                empty.className = "text-body-secondary";
                empty.textContent = "Pre tento deň nie je dostupné menu.";
                list.append(empty);
                continue;
            }

            for (const food of day.items) {
                const item = document.createElement("div");
                item.className = "card border-0 shadow-sm mb-3";

                const heading = document.createElement("h3");
                heading.className = "h6 fw-bold text-secondary mb-2";
                heading.textContent = food.heading;

                const description = document.createElement("p");
                description.className = "text-muted small mb-2";
                description.textContent = food.desc;

                const price = document.createElement("p");
                price.className = "mb-0 fw-bold text-success";

                if (food.priceText) {
                    price.textContent = food.priceText;
                } else if (typeof food.price === "number") {
                    price.textContent =
                        `${food.price.toFixed(2).replace(".", ",")} €`;
                } else {
                    price.textContent = "Cena neuvedená";
                }

                item.append(heading, description, price);
                list.append(item);
            }
        }
    }

    select.addEventListener("change", renderDay);

    container.append(select, list);
    renderDay();

    return container;
}

function createCard(source) {
    const result = results[source.id];

    const column = document.createElement("div");
    column.className = "col-12 col-md-6 col-lg-4";
    column.dataset.sourceId = source.id;
    column.hidden = visibleSources[source.id] === false;

    const card = document.createElement("article");
    card.className = "card h-100";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("a");
    title.className = "h5 mb-0";
    title.textContent = source.name;
    title.href = source.Url;

    const refreshOneButton = document.createElement("button");
    refreshOneButton.className = "btn btn-sm btn-outline-success";
    refreshOneButton.textContent = "↻";

    refreshOneButton.title = "Aktualizovať menu";

    refreshOneButton.addEventListener("click", async () => {
        refreshOneButton.disabled = true;
        refreshOneButton.textContent = "Načítavam…";

        await loadOne(source, true);

        refreshOneButton.disabled = false;
        refreshOneButton.textContent = "↻";
    });

    header.classList.add(
        "d-flex",
        "justify-content-between",
        "align-items-center"
    );

    header.append(title, refreshOneButton);

    const body = document.createElement("div");
    body.className = "card-body";

    if (result?.state === "loading" || !result) {
        body.textContent = "Načítavam menu…";

    } else if (result.state === "error") {
        body.classList.add("text-danger");
        body.textContent =
            `Menu sa nepodarilo načítať: ${result.error}`;

        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "btn btn-sm btn-outline-danger";
        retry.textContent = "Skúsiť znova";
        retry.addEventListener("click", () => loadOne(source, true));
        body.append(retry);

    } else if (result.state === "success") {
        body.append(createDayMenu(source, result.days));
    }
    const footer = document.createElement("div");
    footer.className = "card-footer small text-body-secondary";
    footer.textContent = result?.updatedAt
        ? `${result.fromStorage ? "Uložené menu" : "Aktualizované"}: ${result.updatedAt.toLocaleString("sk-SK")}`
        : "Zatiaľ nenačítané";
    card.append(header, body, footer);
    column.append(card);

    return column;
}

function renderCards() {
    cards.replaceChildren(
        ...SOURCES.map(source => createCard(source))
    );
}

async function loadOne(source, forceRefresh = false) {
    if (!forceRefresh) {
        const saved = loadSavedMenu(source.id);
        if (saved) {
            results[source.id] = {
                state: "success",
                days: saved.days,
                updatedAt: saved.savedAt,
                fromStorage: true
            };
            renderCards();
            return results[source.id];
        }
    }
    results[source.id] = { state: "loading" };
    renderCards();
    try {
        const days = await loadSource(source);

        saveMenu(source.id, days);

        results[source.id] = {
            state: "success",
            days,
            updatedAt: new Date(),
            fromStorage: false
        };
    } catch (error) {
        console.error("Chyba pri načítaní:", source.id, error);

        const saved = loadSavedMenu(source.id);

        if (saved) {
            results[source.id] = {
                state: "success",
                days: saved.days,
                updatedAt: saved.savedAt,
                fromStorage: true
            };
        } else {
            results[source.id] = {
                state: "error",
                error: error.message
            };
        }
    }

    renderCards();

    return results[source.id];
}
async function loadAll() {
    refreshButton.disabled = true;
    statusText.textContent = "Obnovujem jedálne...";

    try {
        const allResults = await Promise.all(
            SOURCES.map(source => loadOne(source, true))
        );

        const failures = allResults.filter(
            result => result.state === "error"
        );
        statusText.textContent = failures.length
            ? `Nepodarilo sa načítať ${failures.length} jedální.`
            : "Všetky jedálne sú aktualizované.";

    } finally {
        refreshButton.disabled = false;
    }
}

refreshButton.addEventListener("click", loadAll);

const filters = document.getElementById("filters");

for (const source of SOURCES) {
    const label = document.createElement("label");
    label.className = "form-check form-check-inline";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = true;
    visibleSources[source.id] = true;
    checkbox.addEventListener("change", () => {
        visibleSources[source.id] = checkbox.checked;

        const card = cards.querySelector(
            `[data-source-id="${source.id}"]`
        );

        if (card) {
            card.hidden = !checkbox.checked;
        }
    });

    label.append(checkbox, ` ${source.name}`);
    filters.append(label);
}
// page open
Promise.all(
    SOURCES.map(source => loadOne(source, false))
);
