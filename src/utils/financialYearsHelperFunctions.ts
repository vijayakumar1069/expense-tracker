export function getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    return today.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function generateFinancialYears(): string[] {
    const currentFY = getCurrentFinancialYear();
    const [startYearStr] = currentFY.split("-");
    const currentStartYear = parseInt(startYearStr);

    const years: string[] = [];

    // Generate last 7 years
    for (let i = 7; i > 0; i--) {
        const year = currentStartYear - i;
        years.push(`${year}-${year + 1}`);
    }

    // Include current year
    years.push(currentFY);

    // Generate next 2 years
    for (let i = 1; i <= 2; i++) {
        const year = currentStartYear + i;
        years.push(`${year}-${year + 1}`);
    }

    return years;
}