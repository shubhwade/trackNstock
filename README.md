# Inventory Management System

This repository contains a full-stack Inventory Management System.

- Backend: Spring Boot (Java 21, Maven). Uses H2 in-memory DB by default (configurable to MySQL).
- Frontend: React (Create React App)

Structure after cleanup:

- /frontend - React app (package.json, src/...)
- /pom.xml - Maven build for backend
- /src/main/java/... - Spring Boot sources
- /src/main/resources/application.properties - Spring Boot properties

How to run locally (dev):


1. Backend (requires Java 21 and Maven):

   Set JAVA_HOME to a Java 21 JDK and ensure it's on PATH, then run:

   mvn spring-boot:run

   The backend listens on port 8080 by default.

2. Frontend (requires Node 18+ and npm):

   cd frontend
   npm install
   npm start

The frontend is set to proxy API requests to http://localhost:8080 using `proxy` in `package.json`.

CI: A simple GitHub Actions workflow is included to build backend (maven) and frontend (npm build).

Docker
------
You can build and run both services with Docker and docker-compose.

Build and run:

```powershell
docker-compose build
docker-compose up
```

- Backend will be available at http://localhost:8080
- Frontend will be available at http://localhost:3000 (nginx serves the built static files)

Notes
-----
- The repository includes a `Dockerfile` for the backend (multi-stage Maven build) and a `Dockerfile` for the frontend (build with Node, serve with nginx).
- A basic unit test (`ProductControllerTest`) was added under `src/test/java` (uses MockMvc).

