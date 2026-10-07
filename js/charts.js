// charts.js

const animateCount = (element, targetValue) => {
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentVal = targetValue * progress;
        
        if (element.id === 'transactionCount') {
            element.textContent = Math.round(currentVal);
        } else {
            element.textContent = formatCurrency(currentVal);
        }

        if (currentStep >= steps) {
            clearInterval(interval);
            if (element.id === 'transactionCount') {
                element.textContent = targetValue;
            } else {
                element.textContent = formatCurrency(targetValue);
            }
        }
    }, stepTime);
};

const initDashboardCharts = (data) => {
    // 1. Income vs Expense Doughnut Chart
    const ctxPie = document.getElementById('incomeExpenseChart');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [data.total_income, data.total_expenses],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: function(chart) {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    ctx.restore();
                    const fontSize = (height / 150).toFixed(2);
                    ctx.font = `bold ${fontSize}em sans-serif`;
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#333';
                    
                    const text = 'Balance';
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2 - 15;
                    ctx.fillText(text, textX, textY);

                    const balText = formatCurrency(data.balance);
                    ctx.font = `${fontSize * 0.8}em sans-serif`;
                    ctx.fillStyle = data.balance >= 0 ? '#28a745' : '#dc3545';
                    const balX = Math.round((width - ctx.measureText(balText).width) / 2);
                    const balY = height / 2 + 15;
                    ctx.fillText(balText, balX, balY);
                    ctx.save();
                }
            }]
        });
    }

    // 2. Monthly Trend Line Chart
    const ctxLine = document.getElementById('monthlyTrendChart');
    if (ctxLine && data.monthly_data) {
        const labels = data.monthly_data.map(d => d.month);
        const incomes = data.monthly_data.map(d => d.income);
        const expenses = data.monthly_data.map(d => d.expense);

        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomes,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Expense',
                        data: expenses,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }
};

const renderRecentTransactions = (transactions) => {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No recent transactions</td></tr>';
        return;
    }

    tableBody.innerHTML = transactions.map(tx => {
        const isIncome = tx.type === 'income';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountSign = isIncome ? '+' : '-';
        return `
            <tr>
                <td>${formatDate(tx.date)}</td>
                <td>${tx.description}</td>
                <td><span class="badge bg-secondary">${tx.category}</span></td>
                <td class="${amountClass} text-end font-weight-bold">${amountSign}${formatCurrency(tx.amount)}</td>
            </tr>
        `;
    }).join('');
};

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('monthlyTrendChart')) { // Dashboard page check
        try {
            const result = await apiRequest('api/dashboard/stats.php');
            if (result.success) {
                // Update stats with animation
                if (document.getElementById('totalIncome')) animateCount(document.getElementById('totalIncome'), result.total_income);
                if (document.getElementById('totalExpenses')) animateCount(document.getElementById('totalExpenses'), result.total_expenses);
                if (document.getElementById('balance')) animateCount(document.getElementById('balance'), result.balance);
                if (document.getElementById('transactionCount')) animateCount(document.getElementById('transactionCount'), result.transaction_count);

                // Init charts
                initDashboardCharts(result);

                // Render recent transactions
                if (result.recent_transactions) {
                    renderRecentTransactions(result.recent_transactions);
                }
            }
        } catch (error) {
            showToast('Failed to load dashboard data', 'error');
        }
    }
});

