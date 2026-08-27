const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Helper to ensure students.json exists
function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    }
}

// Read students list from students.json
function getStudents() {
    ensureDataFile();
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading students.json:', err);
        return [];
    }
}

// Save student record to students.json using fs
function saveStudent(newStudent, callback) {
    ensureDataFile();
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let students = [];
        if (!err && data) {
            try {
                students = JSON.parse(data);
            } catch (parseErr) {
                students = [];
            }
        }
        students.push(newStudent);
        fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), 'utf8', (writeErr) => {
            callback(writeErr);
        });
    });
}

// Shared CSS styles for modern, clean UI
const getStyles = () => `
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
        background-color: #f4f7f6;
        color: #333;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }
    .header {
        text-align: center;
        margin-bottom: 30px;
    }
    .header h1 {
        color: #2c3e50;
        font-size: 2.2rem;
        margin-bottom: 8px;
    }
    .header p {
        color: #7f8c8d;
        font-size: 1.05rem;
    }
    .card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        padding: 32px;
        width: 100%;
        max-width: 550px;
    }
    .form-group {
        margin-bottom: 20px;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #34495e;
    }
    .form-group input {
        width: 100%;
        padding: 12px 14px;
        border: 1.5px solid #dcdfe6;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
    }
    .form-group input:focus {
        outline: none;
        border-color: #3498db;
    }
    .btn {
        display: inline-block;
        width: 100%;
        padding: 14px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        transition: background-color 0.2s ease;
    }
    .btn:hover {
        background-color: #2980b9;
    }
    .nav-link {
        display: block;
        text-align: center;
        margin-top: 20px;
        color: #3498db;
        text-decoration: none;
        font-weight: 600;
    }
    .nav-link:hover {
        text-decoration: underline;
    }
    .table-card {
        max-width: 800px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
    }
    th, td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid #eef2f5;
    }
    th {
        background-color: #f8fafc;
        color: #475569;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
    }
    tr:hover {
        background-color: #f8fafc;
    }
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
    }
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        background: #e0f2fe;
        color: #0369a1;
        font-weight: 600;
        font-size: 0.85rem;
    }
`;

// Render Welcome Page & Form (GET /)
function renderForm(res, msg = '') {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Student Record Form</title>
            <style>${getStyles()}</style>
        </head>
        <body>
            <div class="header">
                <h1>🎓 Welcome to Student Record Manager</h1>
                <p>Node.js HTTP & FS Module Demonstration</p>
            </div>

            <div class="card">
                ${msg ? `<div style="padding:12px; margin-bottom:20px; background:#dcfce7; color:#15803d; border-radius:8px; text-align:center; font-weight:600;">${msg}</div>` : ''}
                <form action="/add-student" method="POST">
                    <div class="form-group">
                        <label for="name">Student Name</label>
                        <input type="text" id="name" name="name" placeholder="e.g. John Doe" required />
                    </div>
                    <div class="form-group">
                        <label for="rollNumber">Roll Number</label>
                        <input type="text" id="rollNumber" name="rollNumber" placeholder="e.g. 101" required />
                    </div>
                    <div class="form-group">
                        <label for="course">Course</label>
                        <input type="text" id="course" name="course" placeholder="e.g. Computer Science" required />
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="e.g. john@example.com" required />
                    </div>
                    <button type="submit" class="btn">Add Student</button>
                </form>

                <a href="/students" class="nav-link">📋 View All Student Records →</a>
            </div>
        </body>
        </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

// Render Students List Page (GET /students)
function renderStudentsList(res) {
    const students = getStudents();
    
    let tableRows = '';
    if (students.length === 0) {
        tableRows = `
            <tr>
                <td colspan="4" class="empty-state">No student records found. Add your first student!</td>
            </tr>
        `;
    } else {
        tableRows = students.map(s => `
            <tr>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td><span class="badge">${escapeHtml(s.rollNumber)}</span></td>
                <td>${escapeHtml(s.course)}</td>
                <td>${escapeHtml(s.email)}</td>
            </tr>
        `).join('');
    }

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registered Students</title>
            <style>${getStyles()}</style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Registered Student Records</h1>
                <p>Total Records: ${students.length}</p>
            </div>

            <div class="card table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Roll Number</th>
                            <th>Course</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <a href="/" class="nav-link" style="margin-top: 25px;">➕ Add Another Student</a>
            </div>
        </body>
        </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

// HTML escape helper
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Create HTTP Server using Node built-in http module
const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;
    const method = req.method;

    if (method === 'GET' && pathname === '/') {
        renderForm(res);
    } else if (method === 'GET' && pathname === '/students') {
        renderStudentsList(res);
    } else if (method === 'POST' && (pathname === '/add-student' || pathname === '/')) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsed = querystring.parse(body);
            const student = {
                name: parsed.name ? parsed.name.trim() : '',
                rollNumber: parsed.rollNumber ? parsed.rollNumber.trim() : '',
                course: parsed.course ? parsed.course.trim() : '',
                email: parsed.email ? parsed.email.trim() : ''
            };

            if (student.name && student.rollNumber && student.course && student.email) {
                saveStudent(student, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error saving record');
                    } else {
                        // Redirect to /students
                        res.writeHead(302, { 'Location': '/students' });
                        res.end();
                    }
                });
            } else {
                renderForm(res, '⚠️ Please fill out all required fields.');
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><style>${getStyles()}</style></head>
            <body>
                <div class="card" style="text-align:center;">
                    <h2>404 - Page Not Found</h2>
                    <a href="/" class="nav-link">Return to Home</a>
                </div>
            </body>
            </html>
        `);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Welcome Message: HTTP Server successfully started on port ${PORT}`);
});
