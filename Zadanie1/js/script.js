const button = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");

if (button && menu) {
    button.addEventListener("click", function () {
        menu.classList.toggle("open");
    });
}
function updateCurrentClass() {
    const now = new Date();

    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const cells = document.querySelectorAll(
        ".schedule td[data-day][data-start][data-end]"
    );

    const message = document.querySelector("#current-class-message");

    if (!message || cells.length === 0) {
        return;
    }

    // removes highlight
    cells.forEach(cell => {
        cell.classList.remove("current-class");
    });

    let currentCell = null;
    let nextCell = null;
    let smallestDifference = Infinity;

    cells.forEach(cell => {
        const day = Number(cell.dataset.day);

        const [startHour, startMinute] =
            cell.dataset.start.split(":").map(Number);

        const [endHour, endMinute] =
            cell.dataset.end.split(":").map(Number);

        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;

        // current lesson
        if (
            day === currentDay &&
            currentTime >= start &&
            currentTime < end
        ) {
            currentCell = cell;
        }

        // looking for next lesson
        let daysUntil = (day - currentDay + 7) % 7;

        if (daysUntil === 0 && start <= currentTime) {
            daysUntil = 7;
        }

        const difference = daysUntil * 1440 + start - currentTime;

        if (difference > 0 && difference < smallestDifference) {
            smallestDifference = difference;
            nextCell = cell;
        }
    });

    if (currentCell) {
        currentCell.classList.add("current-class");

        message.textContent =
            "Práve prebieha: " + currentCell.textContent.trim();
    } else if (nextCell) {
        const dayNames = [
            "nedeľu", "pondelok", "utorok", "stredu",
            "štvrtok", "piatok", "sobotu"
        ];

        message.textContent =
            "Výučba práve neprebieha. Najbližšia hodina: " +
            nextCell.textContent.trim() +
            ", " + dayNames[Number(nextCell.dataset.day)] +
            " o " + nextCell.dataset.start + ".";
    } else {
        message.textContent =
            "Výučba práve neprebieha a najbližšiu hodinu sa nepodarilo nájsť.";
    }
}
updateCurrentClass();
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll("[data-filter]");
    const subjectCells = document.querySelectorAll(
        ".schedule td[data-type]"
    );

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const filter = button.dataset.filter;

            subjectCells.forEach(function (cell) {
                if (filter === "all" || cell.dataset.type === filter) {
                    cell.style.visibility = "visible";
                } else {
                    cell.style.visibility = "hidden";
                }
            });
            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");
        });
    });
});
const SEMESTER_START = new Date("2026-09-16T00:00:00");
const SEMESTER_END = new Date("2026-12-12T23:59:59");

function updateSemesterProgress() {
    const progress = document.querySelector("#semester-progress");
    const percentText = document.querySelector("#semester-percent");

    if (!progress || !percentText) {
        return;
    }

    const now = new Date();

    const total = SEMESTER_END - SEMESTER_START;
    const elapsed = now - SEMESTER_START;

    let percent = Math.round((elapsed / total) * 100);

    percent = Math.max(0, Math.min(100, percent));

    document.querySelector("#semester-progress").value = percent;
    document.querySelector("#semester-percent").textContent = percent + " %";
}

updateSemesterProgress();

// ========================================
// 2. LEAFLET MAP
// ========================================

const mapElement = document.querySelector("#map");

if (mapElement) {
    const map = L.map("map").setView(
        [48.151965, 17.072995],
        15
    );
    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);


// ========================================
// 3. MARKER
// ========================================


    let selectedCoordinates = null;

    const placeNameInput = document.querySelector("#place-name");
    const mapMessage = document.querySelector("#map-message");
    const placesList = document.querySelector("#places-list");

// loading info by clicking on the map
    map.on("click", function (event) {
        selectedCoordinates = event.latlng;

        mapMessage.textContent =
            "Vybrané súradnice: " +
            selectedCoordinates.lat.toFixed(5) + ", " +
            selectedCoordinates.lng.toFixed(5);
    });

// adding the place to map and list
    placeNameInput.addEventListener("change", function () {
        const name = placeNameInput.value.trim();

        if (!selectedCoordinates || name === "") {
            return;
        }

        const coordinates = selectedCoordinates;

        const marker = L.marker(coordinates).addTo(map);
        marker.bindPopup(name);

        const newPlace = {
            id: "place-" + Date.now(),
            name: name,
            lat: coordinates.lat,
            lng: coordinates.lng
        };

        places.push(newPlace);
        savePlaces();
        updatePlaceSelects();

        // new item in list
        const item = document.createElement("li");
        const link = document.createElement("button");

        link.type = "button";
        link.textContent = name;

        // when selected, view
        link.addEventListener("click", function () {
            map.setView(coordinates, 16);
            marker.openPopup();
        });

        item.appendChild(link);
        placesList.appendChild(item);

        placeNameInput.value = "";
        selectedCoordinates = null;

        mapMessage.textContent = "Bod bol pridaný na mapu.";
    });

// basic point, house school
    function addPlaceToList(name, coordinates, marker) {
        const item = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = name;

        button.addEventListener("click", function () {
            map.setView(coordinates, 16);
            marker.openPopup();
        });

        item.appendChild(button);
        placesList.appendChild(item);
    }

    const places = [
        { id: "school", name: "FEI STU Bratislava", lat: 48.151965, lng: 17.072995 },
        { id: "home", name: "Domov", lat: 48.268, lng: 19.066 },
        ...JSON.parse(localStorage.getItem("customPlaces") || "[]")
    ];

    function savePlaces() {
        const customPlaces = places.filter(function (place) {
            return place.id !== "school" && place.id !== "home";
        });

        localStorage.setItem("customPlaces", JSON.stringify(customPlaces));
    }

    const startSelect = document.querySelector("#start-place");
    const endSelect = document.querySelector("#end-place");

    function updatePlaceSelects() {
        startSelect.innerHTML = '<option value="">-- Vyber bod --</option>';
        endSelect.innerHTML = '<option value="">-- Vyber cieľ --</option>';

        places.forEach(function (place) {
            const startOption = document.createElement("option");
            startOption.value = place.id;
            startOption.textContent = place.name;
            startSelect.appendChild(startOption);

            const endOption = document.createElement("option");
            endOption.value = place.id;
            endOption.textContent = place.name;
            endSelect.appendChild(endOption);
        });
    }

    updatePlaceSelects();

    function renderPlacesList() {
        placesList.innerHTML = "";

        places.forEach(function (place) {
            const coordinates = [place.lat, place.lng];
            const marker = L.marker(coordinates).addTo(map);

            marker.bindPopup(place.name);

            addPlaceToList(place.name, coordinates, marker);
        });
    }

    renderPlacesList();

    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;

        const toRadians = degrees => degrees * Math.PI / 180;

        const phi1 = toRadians(lat1);
        const phi2 = toRadians(lat2);

        const deltaPhi = toRadians(lat2 - lat1);
        const deltaLambda = toRadians(lon2 - lon1);

        const a =
            Math.sin(deltaPhi / 2) ** 2 +
            Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) ** 2;

        const distance = 2 * R * Math.asin(Math.sqrt(a));

        return distance;
    }

    let distanceLine = null;

    document.querySelector("#calculate-distance")
        .addEventListener("click", function () {
            const start = places.find(
                place => place.id === startSelect.value
            );

            const end = places.find(
                place => place.id === endSelect.value
            );

            const result = document.querySelector("#distance-result");

            if (!start || !end) {
                result.textContent = "Vyber začiatočný bod aj cieľ.";
                return;
            }

            const distance = haversine(
                start.lat, start.lng,
                end.lat, end.lng
            );

            result.textContent =
                "Vzdialenosť z " + start.name +
                " do " + end.name + ": " +
                distance.toFixed(2) + " km.";

            if (distanceLine) {
                map.removeLayer(distanceLine);
            }

            distanceLine = L.polyline(
                [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ],
                {color: "red"}
            ).addTo(map);

            map.fitBounds(distanceLine.getBounds(), {
                padding: [30, 30]
            });
        });
}