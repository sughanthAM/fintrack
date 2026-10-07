CREATE DATABASE IF NOT EXISTS fintrack;
USE fintrack;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type ENUM('income', 'expense') NOT NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_budget (user_id, category, month, year)
);

-- Insert default categories
INSERT INTO categories (name, type) VALUES
('Salary', 'income'), ('Freelance', 'income'), ('Investment', 'income'),
('Business', 'income'), ('Rental', 'income'), ('Other Income', 'income'),
('Food & Dining', 'expense'), ('Transportation', 'expense'), ('Shopping', 'expense'),
('Entertainment', 'expense'), ('Bills & Utilities', 'expense'), ('Health', 'expense'),
('Education', 'expense'), ('Travel', 'expense'), ('Rent', 'expense'), ('Other Expense', 'expense');

-- Insert sample user (password: admin123)
INSERT INTO users (name, email, password) VALUES ('Sugu', 'sugu@fintrack.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample transactions for demo
INSERT INTO transactions (user_id, type, category, amount, description, transaction_date) VALUES
(1, 'income', 'Salary', 50000.00, 'Monthly salary', '2026-10-01'),
(1, 'income', 'Freelance', 15000.00, 'Web development project', '2026-09-15'),
(1, 'income', 'Investment', 5000.00, 'Mutual fund returns', '2026-09-20'),
(1, 'expense', 'Food & Dining', 8000.00, 'Monthly groceries and dining', '2026-10-02'),
(1, 'expense', 'Transportation', 3000.00, 'Fuel and maintenance', '2026-10-01'),
(1, 'expense', 'Bills & Utilities', 5000.00, 'Electricity and internet', '2026-10-03'),
(1, 'expense', 'Shopping', 7000.00, 'Online shopping', '2026-09-25'),
(1, 'expense', 'Entertainment', 2000.00, 'Movie and subscriptions', '2026-09-28'),
(1, 'expense', 'Education', 10000.00, 'Online course', '2026-09-10'),
(1, 'expense', 'Health', 3000.00, 'Gym membership', '2026-09-05'),
(1, 'income', 'Salary', 50000.00, 'Monthly salary', '2026-09-01'),
(1, 'expense', 'Rent', 15000.00, 'Monthly rent', '2026-09-01'),
(1, 'expense', 'Food & Dining', 7500.00, 'Monthly groceries', '2026-09-03'),
(1, 'income', 'Business', 20000.00, 'Consulting fee', '2026-08-20'),
(1, 'expense', 'Travel', 12000.00, 'Weekend trip', '2026-08-15');

-- Insert sample budgets
INSERT INTO budgets (user_id, category, amount, month, year) VALUES
(1, 'Food & Dining', 10000.00, 10, 2026),
(1, 'Transportation', 5000.00, 10, 2026),
(1, 'Shopping', 8000.00, 10, 2026),
(1, 'Entertainment', 3000.00, 10, 2026),
(1, 'Bills & Utilities', 6000.00, 10, 2026),
(1, 'Health', 4000.00, 10, 2026);
