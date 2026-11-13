# Student Learning Portal — Microservices Architecture Suite

Production-grade, enterprise-ready microservices backend for the Student Learning Portal, designed following the **Database-per-Service** and **Single Responsibility** principles.

---

## 1. System Architecture Overview

```
                                 [ React 19 Frontend (Vite) ]
                                        (Port: 5173)
                                              |
                                              | HTTP REST
                                              v
                              +-------------------------------+
                              |    API GATEWAY (Port 8080)    |
                              | - Centralized CORS            |
                              | - Reverse Proxy Routing       |
                              | - JWT Validation & Headers    |
                              +-------------------------------+
                                              |
            +---------------------+-----------+-----------+---------------------+
            |                     |                       |                     |
            v                     v                       v                     v
   +-----------------+   +-----------------+     +-----------------+   +-----------------+
   |  USER-SERVICE   |   | COURSE-SERVICE  |     |RESOURCE-SERVICE |   |ENGAGEMENT-SERVI |
   |   (Port 8081)   |   |   (Port 8082)   |     |   (Port 8083)   |   |   (Port 8084)   |
   +-----------------+   +-----------------+     +-----------------+   +-----------------+
   | - Auth (JWT)    |   | - Course Catalog|     | - Lecture Notes |   | - Campus Events |
   | - Student Info  |   | - Levels        |     | - Exercises     |   | - Event RSVPs   |
   | - Roles & Visits|   | - Enrollments   |     | - Mini-Projects |   | - Contact Form  |
   +-----------------+   +-----------------+     +-----------------+   +-----------------+
            |                     |                       |                     |
            v                     v                       v                     v
   [(user_db Schema)]    [(course_db Schema)]   [(resource_db Schema)][(engagement_db)]
```

---

## 2. Microservice Port Allocations & Endpoints

| Microservice | Port | Database | Primary Endpoints |
|---|---|---|---|
| **`api-gateway`** | `8080` | None (Proxy) | `/api/v1/**` (Proxies all requests), `/api/v1/gateway/status`, `/api/v1/gateway/health` |
| **`user-service`** | `8081` | `user_db` | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/users/profile`, `PUT /api/v1/users/profile`, `POST /api/v1/users/profile/visit` |
| **`course-service`** | `8082` | `course_db` | `GET /api/v1/courses`, `GET /api/v1/courses?level=Beginner`, `GET /api/v1/courses/{id}`, `POST /api/v1/courses`, `POST /api/v1/enrollments`, `GET /api/v1/enrollments/student/{id}`, `PUT /api/v1/enrollments/{id}/progress` |
| **`resource-service`**| `8083` | `resource_db` | `GET /api/v1/resources`, `GET /api/v1/resources?type=NOTES`, `GET /api/v1/resources/{id}`, `POST /api/v1/resources`, `POST /api/v1/resources/{id}/download` |
| **`engagement-service`**|`8084`| `engagement_db`| `GET /api/v1/events`, `POST /api/v1/events`, `POST /api/v1/events/{id}/register`, `POST /api/v1/inquiries`, `GET /api/v1/inquiries`, `PUT /api/v1/inquiries/{id}/status` |

---

## 3. Database Ownership (Database-Per-Service)

- **`user_db`**: Tables `users`, `student_profiles`
- **`course_db`**: Tables `courses`, `enrollments`
- **`resource_db`**: Table `resources`
- **`engagement_db`**: Tables `events`, `event_registrations`, `inquiries`

*Rule:* Zero cross-service database access. Cross-service references use scalar IDs (`studentId`, `courseId`).

---

## 4. How to Run

### Option A: One-Click Startup (All 5 Microservices)
From the `backend/` directory in PowerShell:
```powershell
.\start-microservices.ps1
```

### Option B: Run Any Microservice Independently
```powershell
cd backend/user-service
mvn spring-boot:run

cd backend/course-service
mvn spring-boot:run

cd backend/resource-service
mvn spring-boot:run

cd backend/engagement-service
mvn spring-boot:run

cd backend/api-gateway
mvn spring-boot:run
```

### Option C: Run Unit Test Suites
```powershell
cd backend/user-service && mvn test
cd backend/course-service && mvn test
cd backend/resource-service && mvn test
cd backend/engagement-service && mvn test
cd backend/api-gateway && mvn test
```

---

## 5. Optional Local Evaluation Accounts

No default passwords are stored in source. To seed local student and administrator accounts on first startup, set `PORTAL_SEED_STUDENT_PASSWORD` and `PORTAL_SEED_ADMIN_PASSWORD` in the project-root `.env` file to private values. Leave either value empty to disable that account. Existing accounts are not overwritten.
