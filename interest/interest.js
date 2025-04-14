document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("interestForm");
    const resultSection = document.getElementById("resultSection");
    const finalRateDisplay = document.getElementById("finalRateDisplay");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const fundingRate = parseFloat(document.getElementById("fundingRate").value);
        const arrangerFee = parseFloat(document.getElementById("arrangerFee").value);
        const stockExchangeFee = parseFloat(document.getElementById("stockExchangeFee").value);
        const centralDepositoryFee = parseFloat(document.getElementById("centralDepositoryFee").value);
        const legalFee = parseFloat(document.getElementById("legalFee").value);
        const miscellaneous = parseFloat(document.getElementById("miscellaneous").value);
        const weightedLoanMaturity = parseFloat(document.getElementById("weightedLoanMaturity").value);
        const principalAmount = parseFloat(document.getElementById("principalAmount").value);

        if ([fundingRate, arrangerFee, stockExchangeFee, centralDepositoryFee, legalFee, miscellaneous, weightedLoanMaturity, principalAmount].some(isNaN)) {
            alert("Please fill in all fields with valid numeric values.");
            return;
        }

        if (weightedLoanMaturity <= 0 || principalAmount <= 0) {
            alert("Loan maturity and principal amount must be greater than zero.");
            return;
        }

        const totalFees = arrangerFee + stockExchangeFee + centralDepositoryFee + legalFee + miscellaneous;
        const interestRate = (((totalFees / weightedLoanMaturity) / principalAmount) * 100) + fundingRate;

        finalRateDisplay.textContent = interestRate.toFixed(2);
        resultSection.classList.add("show");
    });

    document.getElementById("resetButton").addEventListener("click", () => {
        form.reset();
        resultSection.classList.remove("show");
    });
});
