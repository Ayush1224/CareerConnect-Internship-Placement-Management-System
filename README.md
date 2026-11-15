# 🎓 CareerConnect
### Internship & Placement Management System

**Developed by Ayush Das**

CareerConnect is a full-stack web application designed to simplify and digitalize the internship and campus placement process. It provides a centralized platform for students, recruiters, and placement administrators to manage job opportunities, applications, interviews, and recruitment activities efficiently.

Built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**, CareerConnect offers a modern, responsive, and role-based user experience.

---

## 🚀 Key Features

### 👨‍🎓 Student Module
- Student registration and secure login
- Personalized student dashboard
- Profile management
- Browse internships and placement opportunities
- Apply for eligible job openings
- Track application status
- Receive interview updates and notifications

### 🏢 Recruiter Module
- Recruiter authentication and dashboard
- Create and manage job postings
- View student applications
- Review applicant information
- Shortlist candidates
- Manage recruitment and interview processes

### 🛡️ Admin Module
- Administrative dashboard
- Manage students and recruiters
- Monitor placement activities
- Manage job opportunities
- Track applications and recruitment progress
- Oversee platform activities

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB, MongoDB Atlas |
| Authentication | JWT (JSON Web Token) |
| API | RESTful APIs |
| Version Control | Git, GitHub |
| Development Tools | VS Code, npm |

## 🏗️ System Architecture

CareerConnect follows a three-tier architecture:

```text
        React.js Frontend
                |
                | HTTP / REST API
                |
        Node.js + Express.js
                |
                | Mongoose ODM
                |
          MongoDB Atlas
```

**Frontend:** Handles user interfaces, navigation, dashboards, and user interactions.

**Backend:** Manages business logic, authentication, authorization, and REST API endpoints.

**Database:** Stores student, recruiter, job, application, and notification information.

## 📂 Project Structure

```text
CareerConnect/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Ensure the following are installed:

- Node.js and npm
- Git
- VS Code or another code editor
- MongoDB Atlas account

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

```bash
cd YOUR_REPOSITORY
```

Replace the placeholders with your GitHub repository details.

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use the environment variable names expected by your backend configuration.

**Security:** Never upload `.env` files, database credentials, or JWT secrets to GitHub.

### Step 5: Start the Backend

```bash
cd backend
npm run dev
```

The backend runs on the configured port, typically:

```text
http://localhost:5000
```

### Step 6: Start the Frontend

Open another terminal in the project root.

```bash
npm run dev
```

Open the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

## 🔐 Authentication and Security

- JWT-based authentication
- Role-based authorization
- Protected dashboard routes
- Backend authentication middleware
- Environment-based configuration
- Secure API access for authorized users

## 📊 Database Design

CareerConnect uses MongoDB to store and manage application data.

Major data entities include:

- Users
- Student profiles
- Recruiter profiles
- Job postings
- Applications
- Interview information
- Notifications

MongoDB Atlas provides cloud-hosted database infrastructure.

## 🎯 Project Objectives

The main objectives of CareerConnect are to:

1. Digitalize internship and placement management.
2. Simplify communication between students and recruiters.
3. Centralize recruitment information.
4. Improve application tracking and transparency.
5. Reduce manual administrative work.
6. Provide a scalable, maintainable full-stack application.

## 🔮 Future Enhancements

- Resume analysis and job recommendations
- Email and SMS notifications
- Advanced placement analytics
- Interview scheduling calendar
- Real-time communication
- AI-powered candidate matching
- Improved reporting and export functionality

## 👨‍💻 Developer

**Ayush Das**

*MCA Student | Aspiring Full-Stack Developer*

**Project:** CareerConnect – Internship & Placement Management System

**Specialization:** MERN Stack Development

**Technologies:** React.js, Node.js, Express.js, MongoDB, JavaScript

## 📄 License

This project was developed for educational, academic, and portfolio purposes.

---

⭐ **If you find this project useful, consider giving the repository a star!**

**Made with ❤️ by Ayush Das**
