const API_URL = "https://calendarific.com/api/v2/holidays";
const API_KEY = "cZit84DDhAR8d00x9FB5vg5WJaJ0NMnS";

// COUNTRY LIST
const countries = [
    ["af", "Afghanistan"], ["al", "Albania"], ["am", "Armenia"], ["ar", "Argentina"], ["at", "Austria"],
    ["au", "Australia"], ["az", "Azerbaijan"], ["ae", "United Arab Emirates"], ["ba", "Bosnia and Herzegovina"],
    ["bd", "Bangladesh"], ["be", "Belgium"], ["bg", "Bulgaria"], ["bo", "Bolivia"], ["br", "Brazil"],
    ["by", "Belarus"], ["ca", "Canada"], ["ch", "Switzerland"], ["cl", "Chile"], ["cn", "China"],
    ["co", "Colombia"], ["cr", "Costa Rica"], ["cu", "Cuba"], ["cy", "Cyprus"], ["cz", "Czechia"],
    ["de", "Germany"], ["dk", "Denmark"], ["do", "Dominican Republic"], ["dz", "Algeria"], ["ec", "Ecuador"],
    ["es", "Spain"], ["fi", "Finland"], ["fr", "France"], ["gb", "United Kingdom"], ["ge", "Georgia"],
    ["gr", "Greece"], ["gt", "Guatemala"], ["hn", "Honduras"], ["hr", "Croatia"], ["ht", "Haiti"],
    ["hu", "Hungary"], ["id", "Indonesia"], ["ie", "Ireland"], ["il", "Israel"], ["in", "India"],
    ["iq", "Iraq"], ["ir", "Iran"], ["is", "Iceland"], ["it", "Italy"], ["jo", "Jordan"],
    ["jp", "Japan"], ["kg", "Kyrgyzstan"], ["kh", "Cambodia"], ["kz", "Kazakhstan"], ["kr", "South Korea"],
    ["kw", "Kuwait"], ["lb", "Lebanon"], ["lk", "Sri Lanka"], ["lt", "Lithuania"], ["lu", "Luxembourg"],
    ["lv", "Latvia"], ["md", "Moldova"], ["me", "Montenegro"], ["mn", "Mongolia"], ["mt", "Malta"],
    ["mx", "Mexico"], ["my", "Malaysia"], ["mv", "Maldives"], ["ni", "Nicaragua"], ["nl", "Netherlands"],
    ["no", "Norway"], ["nz", "New Zealand"], ["om", "Oman"], ["pa", "Panama"], ["pe", "Peru"],
    ["ph", "Philippines"], ["pk", "Pakistan"], ["pl", "Poland"], ["ps", "Palestine"], ["pt", "Portugal"],
    ["py", "Paraguay"], ["qa", "Qatar"], ["ro", "Romania"], ["rs", "Serbia"], ["ru", "Russia"],
    ["se", "Sweden"], ["sg", "Singapore"], ["si", "Slovenia"], ["sk", "Slovakia"], ["sy", "Syria"],
    ["th", "Thailand"], ["tj", "Tajikistan"], ["tm", "Turkmenistan"], ["tr", "Turkey"], ["tw", "Taiwan"],
    ["ua", "Ukraine"], ["us", "United States"], ["uy", "Uruguay"], ["uz", "Uzbekistan"], ["ve", "Venezuela"],
    ["vn", "Vietnam"], ["ye", "Yemen"]
];

// Populate dropdowns
["hostCountry", "clientCountry", "fundingCountry"].forEach(id => {
    const select = document.getElementById(id);
    countries.forEach(([code, name]) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${code} - ${name}`;
        select.appendChild(option);
    });
});

// Main logic
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("startingForm");
    const disbursementDateInput = document.getElementById("disbursementDate");
    const resultSection = document.getElementById("resultSection");
    const disbursementDateDisplay = document.getElementById("disbursementDateDisplay");
    const startingDateDisplay = document.getElementById("startingDateDisplay");
    const totalDaysDisplay = document.getElementById("totalDaysDisplay");

    // Set default date to today
    const todayStr = new Date().toISOString().split("T")[0];
    disbursementDateInput.value = todayStr;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const disbursementDate = new Date(disbursementDateInput.value);
        const businessDays = parseInt(document.getElementById("businessDays").value);

        const countryCodes = [
            document.getElementById("hostCountry").value,
            document.getElementById("clientCountry").value,
            document.getElementById("fundingCountry").value
        ];

        // Validate inputs
        if (isNaN(businessDays) || businessDays <= 0) {
            alert("❗ Please enter a valid number of business days.");
            return;
        }

        if ([0, 6].includes(disbursementDate.getDay())) {
            alert("❗ Disbursement date cannot be on a weekend.");
            return;
        }

        const holidays = await fetchHolidaySet(disbursementDate, countryCodes);

        let latestStartDate = new Date(disbursementDate);
        let counted = 0;

        while (counted < businessDays) {
            latestStartDate.setDate(latestStartDate.getDate() - 1);
            const iso = latestStartDate.toISOString().split("T")[0];
            if (isBusinessDay(latestStartDate, holidays)) {
                counted++;
            }
        }

        // Final check to ensure the result is a business day
        latestStartDate = adjustToPreviousBusinessDay(latestStartDate, holidays);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (latestStartDate < today) {
            alert("⚠️ The latest starting date cannot be earlier than today.");
            return;
        }

        disbursementDateDisplay.textContent = disbursementDate.toDateString();
        startingDateDisplay.textContent = latestStartDate.toDateString();
        totalDaysDisplay.textContent = businessDays;
        resultSection.classList.remove("hidden");
    });

    document.getElementById("resetButton").onclick = () => {
        form.reset();
        resultSection.classList.add("hidden");
    };

    document.getElementById("exportButton").onclick = () => {
        const csv = `Disbursement Date,Latest Starting Date,Business Days\n"${disbursementDateDisplay.textContent}","${startingDateDisplay.textContent}","${totalDaysDisplay.textContent}"`;
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "latest_starting_date.csv";
        link.click();
    };
});

// Helpers
function isBusinessDay(date, holidaysSet) {
    const iso = date.toISOString().split("T")[0];
    const day = date.getDay();
    return day !== 0 && day !== 6 && !holidaysSet.has(iso);
}

function adjustToPreviousBusinessDay(date, holidaysSet) {
    const adjusted = new Date(date);
    while (!isBusinessDay(adjusted, holidaysSet)) {
        adjusted.setDate(adjusted.getDate() - 1);
    }
    return adjusted;
}

async function fetchHolidaySet(refDate, countryCodes) {
    const years = [refDate.getFullYear(), refDate.getFullYear() - 1, refDate.getFullYear() + 1];
    const set = new Set();

    for (const year of years) {
        for (const code of countryCodes) {
            try {
                const res = await fetch(`${API_URL}?api_key=${API_KEY}&country=${code}&year=${year}`);
                const data = await res.json();
                const holidays = data.response?.holidays || [];

                for (const h of holidays) {
                    const iso = h.date.iso.split("T")[0];
                    const d = new Date(iso);
                    if (d.getDay() !== 0 && d.getDay() !== 6) set.add(iso); // Exclude weekend holidays
                }
            } catch (err) {
                console.error(`❌ Error fetching holidays for ${code} in ${year}:`, err);
            }
        }
    }

    return set;
}
