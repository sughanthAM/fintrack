// app.js

// Helper: Format currency to Indian Rupee
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Helper: Format date to DD MMM YYYY
const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Helper: API Request wrapper
const apiRequest = async (url, method = 'GET', data = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Toast notification function
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add simple styles directly or assume CSS handles `.toast` and `.toast-success` etc.
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '5px',
        color: '#fff',
        backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s'
    });

    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => { toast.style.opacity = '1'; }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', async () => {
    // Sidebar & Mobile Menu Toggle
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('sidebarToggle');
    const mobileToggleBtn = document.getElementById('mobileMenuToggle');
    
    if (sidebar && mainContent && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('shifted');
        });
    }

    if (sidebar && mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // User Dropdown Toggle
    const userDropdownBtn = document.getElementById('userDropdownToggle');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    if (userDropdownBtn && userDropdownMenu) {
        userDropdownBtn.addEventListener('click', () => {
            userDropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!userDropdownBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // Auth Check for Dashboard Pages
    const isDashboardPage = ['dashboard.html', 'transactions.html', 'budget.html', 'reports.html'].some(page => window.location.pathname.endsWith(page));
    
    if (isDashboardPage) {
        try {
            const result = await apiRequest('api/auth/check.php');
            if (!result.success) {
                window.location.href = 'login.html';
            } else {
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = result.user.name;
            }
        } catch (error) {
            window.location.href = 'login.html';
        }
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const result = await apiRequest('api/auth/login.php', 'POST', { email, password });
                if (result.success) {
                    sessionStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                } else {
                    showToast(result.message || 'Login failed', 'error');
                }
            } catch (error) {
                showToast('An error occurred during login', 'error');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }

            try {
                const result = await apiRequest('api/auth/register.php', 'POST', { name, email, password });
                if (result.success) {
                    showToast('Registration successful! Please login.', 'success');
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    showToast(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showToast('An error occurred during registration', 'error');
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const result = await apiRequest('api/auth/logout.php');
                if (result.success) {
                    sessionStorage.removeItem('user');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                showToast('Logout failed', 'error');
            }
        });
    }

    // Smooth Scroll for index.html anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message sent successfully!', 'success');
            contactForm.reset();
        });
    }
});


