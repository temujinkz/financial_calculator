document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('disbursementForm');
    const calculateButton = document.getElementById('calculateButton');
    const exportButton = document.getElementById('exportButton');
    const resetButton = document.getElementById('resetButton');
    const resultSection = document.getElementById('resultSection');

    // Result display elements
    const startDateDisplay = document.getElementById('startDateDisplay');
    const disbursementDateDisplay = document.getElementById('disbursementDateDisplay');
    const totalDaysDisplay = document.getElementById('totalDaysDisplay');

    // Input elements
    const startingDateInput = document.getElementById('startingDate');
    const hostCountrySelect = document.getElementById('hostCountry');
    const clientCountrySelect = document.getElementById('clientCountry');
    const fundingCountrySelect = document.getElementById('fundingCountry');
    const businessDaysInput = document.getElementById('businessDays');

    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    startingDateInput.value = formattedDate;

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDisbursementDate();
    });

    // Reset button handler
    resetButton.addEventListener('click', function() {
        form.reset();
        startingDateInput.value = formattedDate;
        resultSection.classList.add('hidden');
    });

    // Export button handler
    exportButton.addEventListener('click', function() {
        if (resultSection.classList.contains('hidden')) {
            alert('Please calculate results before exporting');
            return;
        }
        exportResults();
    });

    // Calculate disbursement date
    function calculateDisbursementDate() {
        // Get form values
        const startDate = new Date(startingDateInput.value);
        const hostCountry = hostCountrySelect.value;
        const clientCountry = clientCountrySelect.value;
        const fundingCountry = fundingCountrySelect.value;
        const businessDays = parseInt(businessDaysInput.value);

        // Validate inputs
        if (!startDate || isNaN(startDate.getTime())) {
            showError('Please select a valid starting date');
            return;
        }

        if (!hostCountry || !clientCountry || !fundingCountry) {
            showError('Please select all countries');
            return;
        }

        if (isNaN(businessDays) || businessDays <= 0) {
            showError('Please enter a valid number of business days');
            return;
        }

        // In a real implementation, you would call your API here to calculate the date
        // For now, we'll implement a simple calculation
        const disbursementDate = addBusinessDays(startDate, businessDays);

        // Display results
        displayResults(startDate, disbursementDate, businessDays);
    }

    // Simple function to add business days to a date
    function addBusinessDays(startDate, days) {
        let date = new Date(startDate.getTime());
        let count = 0;

        while (count < days) {
            date.setDate(date.getDate() + 1);
            // Skip weekends
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                count++;
            }
        }

        return date;
    }

    // Display calculation results
    function displayResults(startDate, disbursementDate, businessDays) {
        // Format dates for display
        const formattedStartDate = formatDate(startDate);
        const formattedDisbursementDate = formatDate(disbursementDate);

        // Update result displays
        startDateDisplay.textContent = formattedStartDate;
        disbursementDateDisplay.textContent = formattedDisbursementDate;
        totalDaysDisplay.textContent = businessDays;

        // Show results section with animation
        resultSection.classList.remove('hidden');
        resultSection.classList.add('show');

        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Format date for display
    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Export results to CSV
    function exportResults() {
        const startDate = startDateDisplay.textContent;
        const disbursementDate = disbursementDateDisplay.textContent;
        const totalDays = totalDaysDisplay.textContent;

        const data = [
            ['Starting Date', 'Disbursement Date', 'Business Days'],
            [startDate, disbursementDate, totalDays]
        ];

        let csvContent = "data:text/csv;charset=utf-8,";

        data.forEach(function(rowArray) {
            const row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "disbursement_calculation.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Show error message
    function showError(message) {
        alert(message);
    }

    // Add input animations
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});