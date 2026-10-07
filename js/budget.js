// budget.js

const loadBudgets = async () => {
    const container = document.getElementById('budgetCardsContainer');
    if (!container) return;

    const month = document.getElementById('budgetMonth')?.value;
    const year = document.getElementById('budgetYear')?.value;

    container.innerHTML = '<p class="text-center w-100">Loading budgets...</p>';

    try {
        const result = await apiRequest(`api/budgets/read.php?month=${month}&year=${year}`);
        
        if (result.success) {
            renderBudgets(result.budgets);
        } else {
            container.innerHTML = `<p class="text-center text-danger w-100">${result.message || 'Error loading budgets'}</p>`;
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-danger w-100">Failed to load budgets</p>';
        showToast('Error loading budgets', 'error');
    }
};

const renderBudgets = (budgets) => {
    const container = document.getElementById('budgetCardsContainer');
    const summaryContainer = document.getElementById('budgetSummary');
    
    if (budgets.length === 0) {
        container.innerHTML = '<p class="text-center text-muted w-100">No budgets set for this month.</p>';
        if (summaryContainer) summaryContainer.innerHTML = '';
        return;
    }

    let totalBudget = 0;
    let totalSpent = 0;

    container.innerHTML = budgets.map(b => {
        totalBudget += parseFloat(b.amount);
        totalSpent += parseFloat(b.spent);
        
        const percent = Math.min(b.percentage, 100);
        let barColor = 'bg-success';
        if (percent > 75 && percent <= 90) barColor = 'bg-warning';
        if (percent > 90) barColor = 'bg-danger';

        const isOverspent = b.remaining < 0;
        const remainingText = isOverspent ? 'Overspent' : 'Remaining';
        const cardClass = isOverspent ? 'border-danger' : '';

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card ${cardClass} h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">🏷️ ${b.category}</h5>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBudget(${b.id})" title="Delete Budget">&times;</button>
                        </div>
                        <h3 class="mb-3">${formatCurrency(b.amount)}</h3>
                        <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar ${barColor}" role="progressbar" style="width: ${percent}%"></div>
                        </div>
                        <div class="d-flex justify-content-between text-muted small">
                            <span>Spent: ${formatCurrency(b.spent)}</span>
                            <span class="${isOverspent ? 'text-danger font-weight-bold' : ''}">${remainingText}: ${formatCurrency(Math.abs(b.remaining))}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (summaryContainer) {
        const totalRemaining = totalBudget - totalSpent;
        summaryContainer.innerHTML = `
            <div class="row text-center bg-light p-3 rounded shadow-sm mb-4">
                <div class="col-4 border-end">
                    <h6 class="text-muted">Total Budget</h6>
                    <h4 class="text-primary">${formatCurrency(totalBudget)}</h4>
                </div>
                <div class="col-4 border-end">
                    <h6 class="text-muted">Total Spent</h6>
                    <h4 class="text-danger">${formatCurrency(totalSpent)}</h4>
                </div>
                <div class="col-4">
                    <h6 class="text-muted">Total Remaining</h6>
                    <h4 class="${totalRemaining < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(totalRemaining)}</h4>
                </div>
            </div>
        `;
    }
};

const initBudgetPage = () => {
    // Set default month/year to current
    const date = new Date();
    const monthSelect = document.getElementById('budgetMonth');
    const yearSelect = document.getElementById('budgetYear');
    
    if (monthSelect) monthSelect.value = date.getMonth() + 1;
    if (yearSelect) yearSelect.value = date.getFullYear();

    if (monthSelect) monthSelect.addEventListener('change', loadBudgets);
    if (yearSelect) yearSelect.addEventListener('change', loadBudgets);

    // Populate categories
    const catSelect = document.getElementById('budgetCategory');
    if (catSelect) {
        // Assume expenseCategories comes from a shared scope or redefine here
        const expenses = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Education', 'Travel', 'Rent', 'Other Expense'];
        expenses.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            catSelect.appendChild(option);
        });
    }

    // Add Budget Modal
    const modal = document.getElementById('budgetModal');
    const form = document.getElementById('budgetForm');
    const addBtn = document.getElementById('addBudgetBtn');
    const closeBtn = document.getElementById('closeBudgetModal');

    if (addBtn && modal) {
        addBtn.addEventListener('click', () => { modal.style.display = 'block'; });
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                category: document.getElementById('budgetCategory').value,
                amount: parseFloat(document.getElementById('budgetAmount').value),
                month: parseInt(document.getElementById('budgetMonthInput').value),
                year: parseInt(document.getElementById('budgetYearInput').value)
            };

            try {
                const result = await apiRequest('api/budgets/create.php', 'POST', data);
                if (result.success) {
                    showToast('Budget added successfully', 'success');
                    modal.style.display = 'none';
                    form.reset();
                    loadBudgets();
                } else {
                    showToast(result.message || 'Error adding budget', 'error');
                }
            } catch (error) {
                showToast('Failed to add budget', 'error');
            }
        });
    }

    loadBudgets();
};

window.deleteBudget = async (id) => {
    if (confirm('Are you sure you want to delete this budget?')) {
        try {
            const result = await apiRequest('api/budgets/delete.php', 'DELETE', { id });
            if (result.success) {
                showToast('Budget deleted', 'success');
                loadBudgets();
            } else {
                showToast(result.message || 'Error deleting budget', 'error');
            }
        } catch (error) {
            showToast('Failed to delete budget', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('budgetCardsContainer')) {
        initBudgetPage();
    }
});

