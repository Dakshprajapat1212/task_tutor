# Task Tutorials LMS

Full-stack Learning Management System with role-based portals for Students, Faculty, and Administrators, integrated with an interactive QA and API testing suite.

## Project Structure

```
├── frontend/                 # React 18/19 SPA (Vite + Tailwind CSS + Lucide Icons)
└── task_tutorials_backend/   # Laravel 9 REST API Server (Sanctum Auth)
```

## Quick Start Guide

### 1. Start the Backend API (Port 8000)
```bash
cd task_tutorials_backend
php artisan serve --host=127.0.0.1 --port=8000
```
Backend API will be available at: `http://127.0.0.1:8000/api`

### 2. Start the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## Test Accounts & Roles

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tasktutorials.com` | `Password@123` | Admissions approvals, user management, curriculum setup |
| **Faculty** | `faculty1@tasktutorials.com` | `Password@123` | Homework assignments & grading, lecture recording uploads |
| **Student** | `student1@tasktutorials.com` | `Password@123` | Live classes, curriculum library, quizzes, homework submissions |

> **Tip:** You can also use the 1-click **Instant Persona Switcher** on the login page or inside the **QA Tester** drawer on the frontend to switch between any role instantly without typing passwords.
