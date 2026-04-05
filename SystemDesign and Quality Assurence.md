# System Design & Quality Assurance Document
## Project: Smart Book Bank Management System (S-BBMS)

---

## 1. Database Schema (Data Model)

The system uses a relational database (SQLite) to ensure data integrity and consistency. The schema is designed to be normalized to avoid redundancy.

### 1.1 Table: `users`
Stores identity and authentication data for both administrators and students.

| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INTEGER | Primary Key, Auto-increment | Unique identifier for the user |
| `full_name` | TEXT | NOT NULL | The full name of the user |
| `email` | TEXT | UNIQUE, NOT NULL | User email (used as username) |
| `password` | TEXT | NOT NULL | Bcrypt hashed password |
| `role` | TEXT | NOT NULL | Role: `'admin'` or `'student'` |

### 1.2 Table: `books`
Stores the inventory details of the book bank.

| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `book_id` | INTEGER | Primary Key, Auto-increment | Unique identifier for the book |
| `title` | TEXT | NOT NULL | Title of the book |
| `author` | TEXT | NOT NULL | Name of the author |
| `isbn` | TEXT | UNIQUE | International Standard Book Number |
| `category` | TEXT | NOT NULL | Academic category (e.g., 'Data Structures') |
| `status` | TEXT | DEFAULT 'available' | Current state: `'available'` or `'issued'` |

### 1.3 Table: `transactions`
Tracks the movement of books and maintains historical logs for analytics.

| Column | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `trans_id` | INTEGER | Primary Key, Auto-increment | Unique transaction ID |
| `book_id` | INTEGER | Foreign Key $\rightarrow$ `books` | The book involved in the transaction |
| `user_id` | INTEGER | Foreign Key $\rightarrow$ `users` | The student borrowing the book |
| `issue_date` | TEXT | NOT NULL | Date of issue (ISO 8601 format) |
| `return_date` | TEXT | NULLABLE | Date of return (NULL until returned) |
| `status` | TEXT | NOT NULL | Transaction state: `'active'` or `'returned'` |

---

## 2. API Documentation

The backend is a RESTful API developed with Node.js and Express. All requests/responses are in JSON format.

### 2.1 Authentication Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Creates a new user account | Public |
| `POST` | `/api/auth/login` | Validates credentials and returns a JWT | Public |

### 2.2 Inventory Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | Fetch all books (supports query filters) | All |
| `POST` | `/api/books` | Add a new book to the bank | Admin |
| `PUT` | `/api/books/:id` | Update existing book details | Admin |
| `DELETE` | `/api/books/:id` | Remove a book from inventory | Admin |

### 2.3 Transaction Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/issue` | Issue a book to a student | Admin |
| `PUT` | `/api/transactions/return/:id` | Mark a book as returned | Admin |
| `GET` | `/api/transactions/user/:userId` | Get history for a specific student | All |

### 2.4 Smart Features (ML Bridge)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/smart/predict` | Predict demand for next semester | Admin |
| `GET` | `/api/smart/recommend/:userId` | Get personalized book suggestions | Student |

### 2.5 Analytics
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/stats` | Get aggregate library statistics | Admin |

---

## 3. Test Plan & Test Cases

The following test cases are designed to validate the core functionality and security of the S-BBMS.

### 3.1 Functional Testing

| Test ID | Feature | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Valid Login | Correct email & password | Successful login, redirect to Dashboard |
| **TC-02** | Auth | Invalid Login | Incorrect password | Error: "Invalid credentials" |
| **TC-03** | Inventory | Add Book | Valid book details | Book added to DB, status = 'available' |
| **TC-04** | Inventory | Duplicate ISBN | ISBN already in DB | Error: "Book with this ISBN already exists" |
| **TC-05** | Transaction | Issue Book | Valid BookID & UserID | Book status $\rightarrow$ 'issued', transaction created |
| **TC-06** | Transaction | Issue Unavailable | BookID with status='issued' | Error: "Book is currently unavailable" |
| **TC-07** | Transaction | Return Book | Valid TransactionID | Book status $\rightarrow$ 'available', return_date set |

### 3.2 Smart Feature Testing

| Test ID | Feature | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-08** | ML | Demand Prediction | Admin triggers prediction | Returns a list of books based on historical frequency |
| **TC-09** | ML | Recommendations | Student triggers suggestion | Returns books matching the student's category history |

### 3.3 Security & Edge Case Testing

| Test ID | Feature | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-10** | Security | Role Access | Student calls `POST /api/books` | HTTP 403 Forbidden |
| **TC-11** | Validation | Empty Input | Submit form with empty fields | Frontend validation error "Field required" |