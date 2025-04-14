const countryList = [
    ["af", "Afghanistan"], ["al", "Albania"], ["am", "Armenia"], ["ar", "Argentina"],
    ["at", "Austria"], ["au", "Australia"], ["az", "Azerbaijan"], ["ae", "United Arab Emirates"],
    ["ba", "Bosnia and Herzegovina"], ["bd", "Bangladesh"], ["be", "Belgium"], ["bg", "Bulgaria"],
    ["bo", "Bolivia"], ["br", "Brazil"], ["by", "Belarus"], ["ca", "Canada"], ["ch", "Switzerland"],
    ["cl", "Chile"], ["cn", "China"], ["co", "Colombia"], ["cr", "Costa Rica"], ["cu", "Cuba"],
    ["cy", "Cyprus"], ["cz", "Czechia"], ["de", "Germany"], ["dk", "Denmark"], ["do", "Dominican Republic"],
    ["dz", "Algeria"], ["ec", "Ecuador"], ["es", "Spain"], ["fi", "Finland"], ["fr", "France"],
    ["gb", "United Kingdom"], ["ge", "Georgia"], ["gr", "Greece"], ["gt", "Guatemala"], ["hn", "Honduras"],
    ["hr", "Croatia"], ["ht", "Haiti"], ["hu", "Hungary"], ["id", "Indonesia"], ["ie", "Ireland"],
    ["il", "Israel"], ["in", "India"], ["iq", "Iraq"], ["ir", "Iran"], ["is", "Iceland"],
    ["it", "Italy"], ["jo", "Jordan"], ["jp", "Japan"], ["kg", "Kyrgyzstan"], ["kh", "Cambodia"],
    ["kz", "Kazakhstan"], ["kr", "South Korea"], ["kw", "Kuwait"], ["lb", "Lebanon"], ["lk", "Sri Lanka"],
    ["lt", "Lithuania"], ["lu", "Luxembourg"], ["lv", "Latvia"], ["md", "Moldova"], ["me", "Montenegro"],
    ["mn", "Mongolia"], ["mt", "Malta"], ["mx", "Mexico"], ["my", "Malaysia"], ["mv", "Maldives"],
    ["ni", "Nicaragua"], ["nl", "Netherlands"], ["no", "Norway"], ["nz", "New Zealand"], ["om", "Oman"],
    ["pa", "Panama"], ["pe", "Peru"], ["ph", "Philippines"], ["pk", "Pakistan"], ["pl", "Poland"],
    ["ps", "Palestine"], ["pt", "Portugal"], ["py", "Paraguay"], ["qa", "Qatar"], ["ro", "Romania"],
    ["rs", "Serbia"], ["ru", "Russia"], ["se", "Sweden"], ["sg", "Singapore"], ["si", "Slovenia"],
    ["sk", "Slovakia"], ["sy", "Syria"], ["th", "Thailand"], ["tj", "Tajikistan"], ["tm", "Turkmenistan"],
    ["tr", "Turkey"], ["tw", "Taiwan"], ["ua", "Ukraine"], ["us", "United States"], ["uy", "Uruguay"],
    ["uz", "Uzbekistan"], ["ve", "Venezuela"], ["vn", "Vietnam"], ["ye", "Yemen"]
];

const API_URL = "https://calendarific.com/api/v2/holidays";
const API_KEY = "cZit84DDhAR8d00x9FB5vg5WJaJ0NMnS";

// Populate dropdowns
["hostCountry", "clientCountry", "fundingCountry"].forEach(id => {
    const select = document.getElementById(id);
    countryList.forEach(([code, name]) => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = `${code} - ${name}`;
        select.appendChild(opt);
    });
});

function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function isBusinessDay(date, holidaySet) {
    const iso = formatDate(date);
    return !isWeekend(date) && !holidaySet.has(iso);
}

async function fetchHolidays(year, countries) {
    const holidaySet = new Set();

    for (const country of countries) {
        try {
            const url = `${API_URL}?api_key=${API_KEY}&country=${country}&year=${year}`;
            const res = await fetch(url);
            const data = await res.json();

            (data.response?.holidays || []).forEach(h => {
                const iso = h.date.iso.split("T")[0];
                holidaySet.add(iso);
            });
        } catch (err) {
            console.error(`❌ Failed to fetch holidays for ${country} ${year}`, err);
        }
    }

    return holidaySet;
}

async function calculateDisbursementDate(startDate, businessDays, countries) {
    const years = [startDate.getFullYear(), startDate.getFullYear() + 1];
    const allHolidays = new Set();

    for (const year of years) {
        const yearHolidays = await fetchHolidays(year, countries);
        yearHolidays.forEach(h => allHolidays.add(h));
    }

    // Adjust start date if it's not a business day
    while (!isBusinessDay(startDate, allHolidays)) {
        startDate.setDate(startDate.getDate() + 1);
    }

    const resultDate = new Date(startDate);
    let counted = 0;

    while (counted < businessDays) {
        resultDate.setDate(resultDate.getDate() + 1);
        if (isBusinessDay(resultDate, allHolidays)) counted++;
    }

    return resultDate;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('disbursementForm');
    const resultSection = document.getElementById('resultSection');
    const startDateDisplay = document.getElementById('startDateDisplay');
    const disbursementDateDisplay = document.getElementById('disbursementDateDisplay');
    const totalDaysDisplay = document.getElementById('totalDaysDisplay');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const startInput = form.startingDate.value;
        const startDate = new Date(startInput);
        const businessDays = parseInt(form.businessDays.value);
        const countries = [
            form.hostCountry.value,
            form.clientCountry.value,
            form.fundingCountry.value
        ];

        if (isNaN(startDate.getTime())) {
            alert("⚠️ Please select a valid starting date.");
            return;
        }

        if (isWeekend(startDate)) {
            alert("⚠️ Starting date cannot be a weekend.");
            return;
        }

        if (isNaN(businessDays) || businessDays <= 0) {
            alert("⚠️ Please enter a valid number of business days.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
            alert("⚠️ Starting date cannot be earlier than today.");
            return;
        }

        const disbursementDate = await calculateDisbursementDate(new Date(startDate), businessDays, countries);

        startDateDisplay.textContent = startDate.toDateString();
        disbursementDateDisplay.textContent = disbursementDate.toDateString();
        totalDaysDisplay.textContent = businessDays;
        resultSection.classList.remove("hidden");
    });

    document.getElementById("resetButton").onclick = () => {
        form.reset();
        document.getElementById("resultSection").classList.add("hidden");
    };

    document.getElementById("exportButton").onclick = () => {
        const csv = `Starting Date,Disbursement Date,Business Days\n"${startDateDisplay.textContent}","${disbursementDateDisplay.textContent}","${totalDaysDisplay.textContent}"`;
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "disbursement_date.csv";
        link.click();
    };
});