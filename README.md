# FinTrack - Personal Finance Manager

FinTrack is a comprehensive web-based personal finance management application that helps you track your income, expenses, set budgets, and view detailed financial reports.

## Features
- User Authentication (Register/Login)
- Dashboard with Financial Overview and Charts
- Manage Transactions (Income/Expense)
- Set and Monitor Monthly Budgets
- Detailed Monthly and Category-wise Reports
- Fully Responsive UI

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript, Chart.js
- Backend: PHP (7.4+)
- Database: MySQL (5.7+)

## Prerequisites
- XAMPP / WAMP server or similar environment
- PHP 7.4+
- MySQL 5.7+

## Installation

1. **Clone the repository:**
   Clone or copy the project folder to your server's root directory:
   - XAMPP: `C:\xampp\htdocs\fintrack`
   - WAMP: `C:\wamp64\www\fintrack`

2. **Database Setup:**
   - Start Apache and MySQL from your server control panel.
   - Open phpMyAdmin (http://localhost/phpmyadmin).
   - Create a new database or simply import the provided SQL file.
   - Import `database/fintrack.sql`.

3. **Configuration:**
   - Open `config/database.php` and verify the database credentials.
   - By default, it uses `localhost`, `root`, and an empty password.

4. **Run the Application:**
   - Open your browser and navigate to `http://localhost/fintrack` (or the folder name you chose).

## Default Login Credentials
For testing purposes, a sample user is provided:
- **Email:** sugu@fintrack.com
- **Password:** admin123

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| /api/auth/register.php | POST | Register a new user |
| /api/auth/login.php | POST | User login |
| /api/auth/logout.php | GET | Logout current user |
| /api/auth/check.php | GET | Check auth status |
| /api/transactions/create.php | POST | Add a transaction |
| /api/transactions/read.php | GET | Get transactions |
| /api/transactions/update.php | PUT | Edit transaction |
| /api/transactions/delete.php | DELETE | Remove transaction |
| /api/budgets/create.php | POST | Set a budget |
| /api/budgets/read.php | GET | Get budgets & progress |
| /api/budgets/delete.php | DELETE | Remove budget |
| /api/dashboard/stats.php | GET | Dashboard overview |
| /api/reports/monthly.php | GET | Monthly income/expense |
| /api/reports/category.php | GET | Expenses by category |

## Database Schema
- **users:** id, name, email, password, created_at
- **categories:** id, name, type
- **transactions:** id, user_id, type, category, amount, description, transaction_date, created_at
- **budgets:** id, user_id, category, amount, month, year, created_at

## Author
Sugu

## License
MIT
