# Cloud Resource Provisioning and Usage Monitoring Portal



A web-based application for managing cloud resource requests, tracking provisioned resources, and monitoring resource usage through a centralized portal.



## Project Overview



The Cloud Resource Provisioning and Usage Monitoring Portal is designed to simplify cloud resource management. It provides a centralized interface for users to submit resource requests and for administrators to review requests, manage resources, and monitor resource status.



This project was developed as a final-year Information Technology project.



## Objectives



* Centralize cloud resource request management.

* Provide role-based access for users and administrators.

* Track resource requests and their approval status.

* Display resource usage and monitoring information.

* Generate reports to support resource management.



## Technology Stack



| Component         | Technology                  |

| ----------------- | --------------------------- |

| Frontend          | React.js, Vite              |

| Backend           | Node.js, Express.js         |

| Database          | PostgreSQL                  |

| Authentication    | JSON Web Tokens (JWT)       |

| Password Hashing  | bcrypt                      |

| API Testing       | Postman                     |

| Development Tools | Visual Studio Code, pgAdmin |



## Key Features



* User registration and login.

* Authentication and role-based access control.

* Cloud resource request submission.

* Administrative approval and rejection of requests.

* Resource management.

* Resource usage monitoring dashboard.

* Reports and dashboard statistics.

* REST API integration between frontend and backend.



## Supported Cloud Providers



The application includes cloud provider options for:



* Amazon Web Services (AWS)

* Microsoft Azure

* Google Cloud Platform (GCP)



These options represent provider management within the application. Actual provisioning through the providers' cloud APIs should only be claimed if implemented and tested.



## User Roles



### Administrator



* Review submitted resource requests.

* Approve or reject requests.

* Manage resources.

* View monitoring information and reports.



### Cloud User



* Register and log in.

* Submit resource requests.

* View request status.

* Access available user-facing dashboard features.



## Project Structure



```text

Cloud-Resource-Provisioning-System/

â”œâ”€â”€ 02_Frontend/       # React frontend

â”œâ”€â”€ 03_Backend/        # Node.js and Express backend

â”œâ”€â”€ 04_Database_SQL/   # PostgreSQL database script

â”œâ”€â”€ 05_Testing/        # API testing evidence

â”œâ”€â”€ 06_Documentation/  # Project report

â”œâ”€â”€ 07_Screenshots/    # Application screenshots

â”œâ”€â”€ .gitignore

â””â”€â”€ README.md

```



## Application Architecture



```text

User / Administrator

&#x20;        |

&#x20;        v

React Frontend (Vite)

&#x20;        |

&#x20;        v

Node.js + Express REST API

&#x20;        |

&#x20;        v

PostgreSQL Database

```



The frontend communicates with the backend through API endpoints. The backend handles application logic, authentication, authorization, and database operations.



## Getting Started



### Prerequisites



Install the following software:



* Node.js and npm

* PostgreSQL

* Visual Studio Code (recommended)

* Git



### 1. Clone the Repository



```bash

git clone https://github.com/hemalatha0709/Cloud-Resource-Provisioning-System.git

cd Cloud-Resource-Provisioning-System

```



### 2. Configure the Database



1. Start PostgreSQL.

2. Create a database named `cloud_resource_management`.

3. Open the SQL file in `04_Database_SQL/` using pgAdmin or `psql`.

4. Execute the script and verify that the required tables are created.



Check the SQL file before execution and make sure it matches the database name and configuration used by your application.



### 3. Configure the Backend



Open a terminal:



```bash

cd 03_Backend

npm install

```



Create a local `.env` file using the environment variable names expected by the backend configuration.



**Important:** Use your own local database credentials and a private JWT secret. Never commit the `.env` file to GitHub.



Start the backend using the start script defined in `03_Backend/package.json`. For example, if the script is named `start`:



```bash

npm start

```



### 4. Configure the Frontend



Open another terminal from the project root:



```bash

cd 02_Frontend

npm install

npm run dev

```



Open the local address printed by Vite in the terminal.



### 5. Verify the Application



* Confirm that PostgreSQL is running.

* Confirm that the backend starts without errors.

* Confirm that the frontend starts successfully.

* Test login and resource request workflows.

* Verify that API requests work as expected.



Refer to the actual package scripts and backend configuration if your local setup uses different commands or port numbers.



## Testing



API and application testing evidence is available in `05_Testing/`.



Testing activities include authentication checks, API authorization checks, and verification of application workflows.



## Screenshots



Application screenshots are available in `07_Screenshots/`.



Review the screenshots in that directory to see the implemented user interface and dashboard features.



## Project Documentation



The project report is available in `06_Documentation/`.



## Learning Outcomes



* Frontend development with React.

* REST API development using Node.js and Express.

* PostgreSQL database integration.

* JWT-based authentication and role-based authorization.

* API testing using Postman.

* Git and GitHub version control.



## Future Enhancements



* Integrate actual AWS, Azure, or GCP provisioning APIs.

* Add automated resource usage collection.

* Introduce configurable usage thresholds and alerts.

* Improve report export functionality.

* Add deployment and continuous integration workflows.



## Author



**Hemalatha S.**

Final-Year B.Tech Information Technology Student



GitHub: https://github.com/hemalatha0709



## Disclaimer



This is an academic project. Cloud provider integrations, automated provisioning, and live monitoring should be considered implemented only where supported by the actual application code and testing evidence.







