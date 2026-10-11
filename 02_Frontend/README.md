# Cloud Resource Provisioning and Usage Monitoring Portal

**Project ID:** EDUPCCP045
**Project Domain:** Cloud Computing
**Project Type:** Full-Stack Web Application

## 1. Project Overview

The **Cloud Resource Provisioning and Usage Monitoring Portal** is a web-based application developed to manage cloud resource requests, approval workflows, resource allocation records, usage monitoring, notifications, and reports through a centralized platform.

The system provides separate access for **Administrators** and **Cloud Users**. Cloud users can submit and track resource requests, while administrators can review, approve, or reject requests and monitor resource information.

The application is developed using React.js, Node.js, Express.js, PostgreSQL, JWT authentication, and bcrypt password encryption.

---

## 2. Main Features

### Authentication

* User login and registration
* JWT-based authentication
* Password encryption using bcrypt
* Role-based access control

### Cloud User Features

* View dashboard
* Create resource requests
* View request status
* View allocated resources
* Monitor resource usage
* View reports
* View notifications
* Manage profile

### Administrator Features

* Administrator login
* View dashboard statistics
* View all resource requests
* Approve or reject requests
* View resource information
* Monitor resource usage and health
* View reports
* View notifications
* Manage administrator profile

### Resource Management

The system supports resource types such as:

* Virtual Machine (VM)
* Storage
* Database
* Container
* Function

The system maintains cloud provider records for:

* AWS
* Microsoft Azure
* Google Cloud

---

## 3. Technology Stack

| Technology | Purpose                                    |
| ---------- | ------------------------------------------ |
| React.js   | Frontend development                       |
| Vite       | Frontend development server and build tool |
| Node.js    | Backend runtime                            |
| Express.js | REST API development                       |
| PostgreSQL | Database                                   |
| JWT        | Authentication                             |
| bcrypt     | Password encryption                        |
| Axios      | API communication                          |
| Postman    | API testing                                |
| pgAdmin 4  | Database management                        |
| VS Code    | Development environment                    |

---

## 4. System Architecture

The application follows a three-layer architecture:

```text
+-----------------------------+
|       React Frontend        |
|       User Interface        |
+-------------+---------------+
              |
              | REST API
              | Axios + JWT
              v
+-----------------------------+
|    Node.js + Express.js     |
|      Backend / REST API     |
+-------------+---------------+
              |
              | SQL Queries
              v
+-----------------------------+
|       PostgreSQL DB         |
|   cloud_resource_management |
+-----------------------------+
```

The React frontend communicates with the Node.js/Express backend through REST APIs. The backend handles authentication, authorization, business logic, and database operations.

---

## 5. Project Folder Structure

```text
Cloud-Resource-Provisioning-System
│
├── 06_Frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── context
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── style
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
│
├── 07_Backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   └── routes
│   ├── package.json
│   └── package-lock.json
│
├── 10_Documentation
│   └── Final Project Report.docx
│
├── 11_Screenshots
│   └── Project screenshots
│
└── Database
    └── PostgreSQL database backup
```

---

# 6. Database

The project uses **PostgreSQL** as the database management system.

### Database Name

```text
cloud_resource_management
```

### Main Tables

```text
users
roles
permissions
role_permissions
resource_requests
resources
resource_types
cloud_providers
usage_monitoring
notifications
reports
resource_cost
audit_logs
login_history
```

These tables store user information, roles, resource requests, cloud resources, monitoring information, notifications, reports, costs, and audit information.

---

# 7. Prerequisites

Install the following software before running the project:

* Node.js
* npm
* PostgreSQL
* pgAdmin 4
* Visual Studio Code
* Modern web browser
* Postman (for API testing)

---

# 8. Frontend Setup

Open PowerShell or Command Prompt.

Navigate to the frontend folder:

```powershell
cd "C:\Users\Hemalatha Saravanan\OneDrive\Cloud-Resource-Provisioning-System\06_Frontend"
```

Install the required packages:

```powershell
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

Vite will display a local URL, normally similar to:

```text
http://localhost:5173
```

If that port is already in use, Vite may automatically select another available port.

Open the displayed URL in a web browser.

---

# 9. Backend Setup

Open another PowerShell or Command Prompt window.

Navigate to the backend folder:

```powershell
cd "C:\Users\Hemalatha Saravanan\OneDrive\Cloud-Resource-Provisioning-System\07_Backend"
```

Install the required packages:

```powershell
npm install
```

Start the backend server:

```powershell
npm start
```

The backend runs on:

```text
http://localhost:5000
```

The backend connects to the PostgreSQL database when the database configuration is correct.

---

# 10. Environment Configuration

The backend uses environment variables for database and authentication configuration.

The `.env` file is located inside:

```text
07_Backend\.env
```

The `.env` file should contain the required database connection and JWT configuration.

**Important:** Real passwords, database credentials, JWT secrets, API keys, or other sensitive information should not be shared publicly or included in the project report.

---

# 11. Running the Complete Application

Two terminals are required.

### Terminal 1 – Backend

```powershell
cd "C:\Users\Hemalatha Saravanan\OneDrive\Cloud-Resource-Provisioning-System\07_Backend"
npm start
```

### Terminal 2 – Frontend

```powershell
cd "C:\Users\Hemalatha Saravanan\OneDrive\Cloud-Resource-Provisioning-System\06_Frontend"
npm run dev
```

Then open the frontend URL shown by Vite.

The frontend communicates with the backend through REST APIs.

---

# 12. Authentication and Authorization

The application uses **JWT (JSON Web Token)** for user authentication.

After successful login:

1. User credentials are verified.
2. A JWT token is generated.
3. The token is stored on the client side.
4. The token is sent with protected API requests.
5. Backend middleware verifies the token.
6. Role-based middleware controls administrator-only operations.

There are two main user roles:

```text
Administrator
Cloud User
```

Administrator operations such as approving and rejecting requests are protected from normal cloud users.

---

# 13. API Communication

The frontend uses **Axios** to communicate with the backend REST APIs.

The main API categories include:

```text
Authentication
Dashboard
Requests
Admin Requests
Resources
Monitoring
Reports
Notifications
Profile
Cloud Providers
Resource Types
```

Protected requests use the JWT Bearer token for authentication.

---

# 14. Resource Request Workflow

The general request workflow is:

```text
Cloud User
     |
     v
Create Resource Request
     |
     v
Request Stored in Database
     |
     v
Administrator Reviews Request
     |
     +----------+----------+
     |                     |
     v                     v
  APPROVE                REJECT
     |
     v
Resource Record
     |
     v
Monitoring / Reports
```

This workflow helps maintain a clear record of resource requests and their approval status.

---

# 15. Testing

The application was tested using functional testing and API testing with Postman.

The major testing areas include:

* Authentication testing
* Authorization testing
* Resource request creation
* Request approval
* Request rejection
* Resource allocation
* Resource monitoring
* Notification handling
* Report generation
* Protected API access

The final project testing included **10 test cases, with all 10 tests passed**.

---

# 16. Project Status

The following major modules have been implemented:

* Authentication
* Role-based authorization
* Dashboard
* Resource requests
* Administrator request management
* Resource management
* Monitoring
* Reports
* Notifications
* User profile
* PostgreSQL database integration
* REST API integration

The current implementation is an academic/project-level cloud resource management portal.

Automated live provisioning through AWS, Microsoft Azure, or Google Cloud APIs is considered a future enhancement.

---

# 17. Future Enhancements

Future versions of the application can include:

* Live AWS/Azure/Google Cloud API integration
* Automated resource provisioning
* Automated resource deprovisioning
* Real-time monitoring
* Cost optimization
* Cost forecasting
* Auto-scaling
* Advanced alerts
* Production deployment
* Improved logging and observability
* Load balancing and multi-instance deployment

---

# 18. Important Submission Notes

Before submitting the project:

* Do not share the backend `.env` file if it contains real credentials.
* Keep the PostgreSQL database backup with the project submission.
* Keep the final project report inside the documentation folder.
* Keep the project screenshots inside the screenshots folder.
* Make sure both frontend and backend `package.json` files are included.
* Keep `package-lock.json` files for dependency installation.
* Test the application once before final submission.

---

# 19. Project Documentation

The complete project report contains:

* Abstract
* Introduction
* Problem Statement
* Objectives
* Scope
* Existing System
* Proposed System
* Technology Stack
* System Requirements
* System Modules
* System Architecture
* Database Design
* User Interface Design
* Implementation
* Testing
* Results and Screenshots
* Advantages and Limitations
* Future Enhancements
* Conclusion
* References

---

## 20. Conclusion

The **Cloud Resource Provisioning and Usage Monitoring Portal** provides a centralized platform for managing cloud resource requests and monitoring resource information.

The system improves request tracking, administrator approval, resource visibility, monitoring, reporting, and access control through a full-stack web application architecture.
