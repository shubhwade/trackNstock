### Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /workspace/app

# Copy pom.xml for dependency resolution
COPY pom.xml .
# Copy source code
COPY src src/
# Copy application properties
COPY src/main/resources/application.properties src/main/resources/

# Build the application
RUN mvn clean package -DskipTests

### Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
