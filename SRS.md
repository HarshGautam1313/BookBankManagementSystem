# Software Requirements Specification (SRS)
## Project Title: Smart Book Bank Management System (S-BBMS)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a detailed description of the Smart Book Bank Management System (S-BBMS). It outlines the functional and non-functional requirements, the system architecture, and the design constraints. This document serves as the primary blueprint for the development and testing phases of the project.

### 1.2 Project Scope
S-BBMS is a web-based application designed for offline library book banks. Unlike a traditional library, a book bank typically manages textbooks and academic resources for students over longer durations (e.g., a semester). 

**The system will provide:**
* Digital record-keeping of book inventory.
* Automated tracking of issuance and returns.
* An Admin dashboard for analytics.
* An ML-powered Demand Prediction module to forecast book needs for upcoming semesters.
* A Personalized Recommendation system for students based on borrowing patterns.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
| :--- | :--- |
| **S-BBMS** | Smart Book Bank Management System |
| **Admin** | The librarian or staff member managing the system |
| **CRUD** | Create, Read, Update, Delete |
| **ML** | Machine Learning |
| **MVP** | Minimum Viable Product |
| **SQLite** | A lightweight, file-based relational database engine |

---

## 2. Overall Description

### 2.1 Product Perspective
S-BBMS is a standalone web application following a **Client-Server Architecture**. 
* **Frontend:** Developed in React.js for a dynamic user interface.
* **Backend:** Developed in Node.js and Express.js to handle API requests.
* **Database:** SQLite for lightweight and portable data storage.
* **ML Layer:** Python scripts for data analysis and predictions, executed via Node.js child processes.

### 2.2 User Classes and Characteristics
#### 2.2.1 Administrator (Librarian)
* **Role:** Full system control.
* **Responsibilities:** Managing book stock, student records, processing transactions, and analyzing demand trends.
* **Technical Level:** Basic computer literacy.

#### 2.2.2 Student
* **Role:** End-user/Borrower.
* **Responsibilities:** Searching for books, checking availability, viewing personal borrowing history, and receiving academic recommendations.
* **Technical Level:** General web navigation skills.

### 2.3 Design and Implementation Constraints
* **Language Constraints:** Backend must be Node.js; ML logic must be Python.
* **Database Constraint:** Must use SQLite to ensure zero-configuration deployment for the lab demo.
* **Deployment:** Localhost deployment accessible via a local network browser.

### 2.4 Assumptions and Dependencies
* It is assumed that the admin will input synthetic historical data to allow the ML model to generate meaningful predictions.
* The system depends on the Python runtime being installed on the host machine.

---

## 3. System Features (Functional Requirements)

### 3.1 User Management & Authentication
* **FR 1.1:** The system shall allow users to create accounts and log in securely.
* **FR 1.2:** The system shall differentiate between 'Admin' and 'Student' roles upon authentication.
* **FR 1.3:** Admins shall have the authority to modify or delete student accounts.

### 3.2 Inventory Management (Admin Only)
* **FR 2.1:** The Admin shall be able to add new books (Title, Author, ISBN, Category, Quantity).
* **FR 2.2:** The Admin shall be able to update or remove book records.
* **FR 2.3:** The system shall automatically track the status of each book (Available / Issued).

### 3.3 Transaction Management
* **FR 3.1:** The Admin shall be able to issue a book to a student by linking `BookID` to `UserID`.
* **FR 3.2:** The system shall record the `IssueDate` and track the `ReturnDate`.
* **FR 3.3:** The Admin shall be able to mark a book as "Returned," updating the inventory status to "Available."
* **FR 3.4:** The system shall maintain a historical log of all transactions.

### 3.4 Smart Features (ML Layer)
* **FR 4.1 (Demand Prediction):** The system shall analyze transaction patterns using Python to identify high-demand books for the upcoming semester.
* **FR 4.2 (Book Recommendation):** The system shall suggest books to students based on the category of books they have previously borrowed (Content-based filtering).

### 3.5 Analytics and Reporting
* **FR 5.1:** The Admin shall be able to view a dashboard showing total books, active loans, and most demanded categories.

---

## 4. External Interface Requirements

### 4.1 User Interface (UI)
* **Framework:** React.js with a responsive layout.
* **Admin View:** A dashboard with sidebar navigation for Inventory, Transactions, and Analytics.
* **Student View:** A clean search interface and a personalized "Recommended for You" section.

### 4.2 Software Interfaces
* **Database Interface:** Node.js interacts with SQLite via the `sqlite3` driver or Sequelize ORM.
* **ML Interface:** Node.js executes Python scripts using the `child_process` module and captures output via `stdout`.

---

## 5. Non-Functional Requirements

### 5.1 Performance
* API responses for search and inventory queries should be under 2 seconds.
* ML calculations should be handled efficiently to avoid blocking the main Node.js event loop.

### 5.2 Security
* User passwords must be hashed using `bcrypt` before storage.
* Role-Based Access Control (RBAC) must prevent students from accessing Admin API endpoints.

### 5.3 Reliability & Maintainability
* The system must handle edge cases (e.g., issuing a book that is already out of stock) gracefully.
* The codebase must follow a modular structure (Frontend $\rightarrow$ Backend $\rightarrow$ ML Scripts).

---

## 6. Data Requirements (Preliminary Schema)

| Entity | Attributes |
| :--- | :--- |
| **User** | UserID (PK), Name, Email, Password, Role |
| **Book** | BookID (PK), Title, Author, ISBN, Category, Status |
| **Transaction** | TransactionID (PK), BookID (FK), UserID (FK), IssueDate, ReturnDate, Status |