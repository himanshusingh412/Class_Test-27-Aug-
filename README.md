# Node.js Student Record Management System (Class Test)

A lightweight, zero-dependency Node.js web application built using **only** native Node.js built-in modules (`http` and `fs`).

## 📋 Features

- **Built-in `http` Server**: Runs on port `3000` with native request/response handling.
- **Welcome & Form Interface (`GET /`)**: Serves an HTML form to capture student details (Name, Roll Number, Course, Email).
- **Data Storage (`POST /add-student`)**: Parses incoming form data and persists student records to `students.json` using the `fs` module.
- **Student Records View (`GET /students`)**: Displays stored student records from `students.json` in a responsive HTML table.
- **Zero External Dependencies**: No Express, body-parser, or third-party packages used.

## 🚀 How to Run

1. Ensure Node.js is installed (`node -v`).
2. Run the server:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   - **Form**: [http://localhost:3000](http://localhost:3000)
   - **Students List**: [http://localhost:3000/students](http://localhost:3000/students)

## 📁 File Structure

```
├── server.js        # Main HTTP server and routing logic
├── students.json    # JSON storage file for student records
├── README.md        # Project documentation
└── .gitignore       # Git ignore file
```
