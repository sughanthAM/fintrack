// transactions.js

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Other Income'];
const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Education', 'Travel', 'Rent', 'Other Expense'];

let currentPage = 1;
const limit = 10;

const populateCategories = (typeSelectId, categorySelectId) => {
    const typeSelect = document.getElementById(typeSelectId);
    const categorySelect = document.getElementById(categorySelectId);
    
    if (!typeSelect || !categorySelect) return;

    const updateCategories = () => {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        const type = typeSelect.value;
        const categories = type === 'income' ? incomeCategories : type === 'expense' ? expenseCategories : [];
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    };

    typeSelect.addEventListener('change', updateCategories);
    updateCategories(); // Initial population
};

const loadTransactions = async () => {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;

    const filterType = document.getElementById('filterType')?.value || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    const filterFrom = document.getElementById('filterFrom')?.value || '';
    const filterTo = document.getElementById('filterTo')?.value || '';
    const filterSearch = document.getElementById('filterSearch')?.value || '';

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

    try {
        const queryParams = new URLSearchParams({
            type: filterType,
            category: filterCategory,
            from: filterFrom,
            to: filterTo,
            search: filterSearch,
            page: currentPage,
            limit: limit
        }).toString();

        const result = await apiRequest(`api/transactions/read.php?${queryParams}`);
        
        if (result.success) {
            renderTransactions(result.transactions);
            renderPagination(result.pages);
            renderSummary(result.transactions);
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${result.message || 'Error loading transactions'}</td></tr>`;
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load transactions</td></tr>';
        showToast('Error loading transactions', 'error');
    }
};

const renderTransactions = (transactions) => {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found.</td></tr>';
        return;
    }

    tableBody.innerHTML = transactions.map(tx => {
        const isIncome = tx.type === 'income';
        const typeBadge = `<span class="badge ${isIncome ? 'bg-success' : 'bg-danger'}">${isIncome ? 'Income' : 'Expense'}</span>`;
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountSign = isIncome ? '+' : '-';
        
        return `
            <tr>
                <td>${formatDate(tx.date)}</td>
                <td>${tx.description}</td>
                <td>${tx.category}</td>
                <td>${typeBadge}</td>
                <td class="${amountClass} font-weight-bold">${amountSign}${formatCurrency(tx.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${tx.id})">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${tx.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
};

const renderPagination = (totalPages) => {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1" onclick="changePage(${i})">${i}</button>`;
    }
    pagination.innerHTML = html;
};

window.changePage = (page) => {
    currentPage = page;
    loadTransactions();
};

const renderSummary = (transactions) => {
    const summaryEl = document.getElementById('pageSummary');
    if (!summaryEl) return;
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    summaryEl.innerHTML = `
        <div class="d-flex justify-content-between p-3 bg-light rounded">
            <span class="text-success">Total Income: ${formatCurrency(income)}</span>
            <span class="text-danger">Total Expense: ${formatCurrency(expense)}</span>
        </div>
    `;
};

// Modal handlers
const initTransactionModal = () => {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const addBtn = document.getElementById('addTransactionBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    
    if (!modal || !form) return;

    const openModal = () => {
        form.reset();
        document.getElementById('transactionId').value = '';
        modal.style.display = 'block';
    };
    
    const closeModal = () => {
        modal.style.display = 'none';
    };

    if (addBtn) addBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('transactionId').value;
        const data = {
            type: document.getElementById('txType').value,
            category: document.getElementById('txCategory').value,
            amount: parseFloat(document.getElementById('txAmount').value),
            description: document.getElementById('txDescription').value,
            date: document.getElementById('txDate').value
        };

        try {
            const url = id ? 'api/transactions/update.php' : 'api/transactions/create.php';
            const method = id ? 'PUT' : 'POST';
            if (id) data.id = id;

            const result = await apiRequest(url, method, data);
            
            if (result.success) {
                showToast(`Transaction ${id ? 'updated' : 'added'} successfully`, 'success');
                closeModal();
                loadTransactions();
            } else {
                showToast(result.message || 'Error saving transaction', 'error');
            }
        } catch (error) {
            showToast('Failed to save transaction', 'error');
        }
    });
};

window.deleteTransaction = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            const result = await apiRequest('api/transactions/delete.php', 'DELETE', { id });
            if (result.success) {
                showToast('Transaction deleted', 'success');
                loadTransactions();
            } else {
                showToast(result.message || 'Error deleting transaction', 'error');
            }
        } catch (error) {
            showToast('Failed to delete transaction', 'error');
        }
    }
};

window.editTransaction = async (id) => {
    showToast('Edit triggered, populate form here', 'info');
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transactionTableBody')) {
        populateCategories('txType', 'txCategory');
        populateCategories('filterType', 'filterCategory');
        initTransactionModal();
        
        // Filter handlers
        ['filterType', 'filterCategory', 'filterFrom', 'filterTo', 'filterSearch'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => { currentPage = 1; loadTransactions(); });
            if (id === 'filterSearch' && el) el.addEventListener('keyup', () => { currentPage = 1; loadTransactions(); });
        });

        loadTransactions();
    }
});

