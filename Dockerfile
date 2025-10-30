### Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /build

# Copy entire project
COPY . .

# Build the application
RUN mvn clean package -DskipTests

### Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
