// reports.js

let monthlyChartInstance = null;
let categoryChartInstance = null;
let balanceChartInstance = null;
let topCategoriesChartInstance = null;

const loadReportData = async () => {
    const fromMonth = document.getElementById('reportFromMonth')?.value || '';
    const fromYear = document.getElementById('reportFromYear')?.value || '';
    const toMonth = document.getElementById('reportToMonth')?.value || '';
    const toYear = document.getElementById('reportToYear')?.value || '';

    try {
        // Fetch Monthly Data
        const monthlyQuery = new URLSearchParams({ from_month: fromMonth, from_year: fromYear, to_month: toMonth, to_year: toYear }).toString();
        const monthlyRes = await apiRequest(`api/reports/monthly.php?${monthlyQuery}`);
        
        // Fetch Category Data (Using toMonth/toYear as the targeted month for category pie chart, or all if empty)
        const catQuery = new URLSearchParams({ month: toMonth, year: toYear }).toString();
        const catRes = await apiRequest(`api/reports/category.php?${catQuery}`);

        if (monthlyRes.success && catRes.success) {
            renderMonthlyChart(monthlyRes.data);
            renderBalanceTrend(monthlyRes.data);
            renderCategoryChart(catRes.data);
            renderTopCategories(catRes.data);
            updateSummaryCards(monthlyRes.data);
        } else {
            showToast('Error loading report data', 'error');
        }
    } catch (error) {
        showToast('Failed to generate reports', 'error');
    }
};

const renderMonthlyChart = (data) => {
    const ctx = document.getElementById('monthlyComparisonChart');
    if (!ctx) return;

    if (monthlyChartInstance) monthlyChartInstance.destroy();

    const labels = data.map(d => `${d.month}/${d.year}`);
    const incomes = data.map(d => d.income);
    const expenses = data.map(d => d.expense);

    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Income', data: incomes, backgroundColor: '#28a745' },
                { label: 'Expense', data: expenses, backgroundColor: '#dc3545' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
                }
            }
        }
    });
};

const renderBalanceTrend = (data) => {
    const ctx = document.getElementById('balanceTrendChart');
    if (!ctx) return;

    if (balanceChartInstance) balanceChartInstance.destroy();

    const labels = data.map(d => `${d.month}/${d.year}`);
    const balances = data.map(d => d.balance);

    balanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Net Balance',
                data: balances,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: { label: (ctx) => `Balance: ${formatCurrency(ctx.raw)}` }
                }
            }
        }
    });
};

const renderCategoryChart = (data) => {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChartInstance) categoryChartInstance.destroy();

    const labels = data.map(d => d.category);
    const amounts = data.map(d => d.amount);
    const percentages = data.map(d => d.percentage);
    
    // Generate distinct colors
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8AC926', '#1982C4', '#6A4C93'];

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, amounts.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const percent = percentages[ctx.dataIndex];
                            return ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
};

const renderTopCategories = (data) => {
    const ctx = document.getElementById('topCategoriesChart');
    if (!ctx) return;

    if (topCategoriesChartInstance) topCategoriesChartInstance.destroy();

    // Sort by amount descending, take top 5
    const topData = [...data].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const labels = topData.map(d => d.category);
    const amounts = topData.map(d => d.amount);

    topCategoriesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Expense Amount',
                data: amounts,
                backgroundColor: '#dc3545'
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: { label: (ctx) => `${formatCurrency(ctx.raw)}` }
                }
            }
        }
    });
};

const updateSummaryCards = (monthlyData) => {
    const totalInc = monthlyData.reduce((sum, d) => sum + parseFloat(d.income), 0);
    const totalExp = monthlyData.reduce((sum, d) => sum + parseFloat(d.expense), 0);
    const savings = totalInc - totalExp;
    
    // Avg daily (rough estimate: assuming 30 days per month * number of months)
    const monthsCount = monthlyData.length || 1;
    const avgDailyExp = totalExp / (monthsCount * 30);

    const incEl = document.getElementById('reportTotalIncome');
    const expEl = document.getElementById('reportTotalExpense');
    const savEl = document.getElementById('reportTotalSavings');
    const avgEl = document.getElementById('reportAvgDaily');

    if (incEl) incEl.textContent = formatCurrency(totalInc);
    if (expEl) expEl.textContent = formatCurrency(totalExp);
    if (savEl) savEl.textContent = formatCurrency(savings);
    if (avgEl) avgEl.textContent = formatCurrency(avgDailyExp);
};

document.addEventListener('DOMContentLoaded', () => {
    const genBtn = document.getElementById('generateReportBtn');
    if (genBtn || document.getElementById('monthlyComparisonChart')) {
        if (genBtn) {
            genBtn.addEventListener('click', loadReportData);
        }
        
        // Setup default date ranges (last 6 months to current)
        const d = new Date();
        const toMonth = document.getElementById('reportToMonth');
        const toYear = document.getElementById('reportToYear');
        const fromMonth = document.getElementById('reportFromMonth');
        const fromYear = document.getElementById('reportFromYear');

        if (toMonth) toMonth.value = d.getMonth() + 1;
        if (toYear) toYear.value = d.getFullYear();
        
        d.setMonth(d.getMonth() - 5); // 6 months ago
        if (fromMonth) fromMonth.value = d.getMonth() + 1;
        if (fromYear) fromYear.value = d.getFullYear();

        loadReportData();
    }
});

