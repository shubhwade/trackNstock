### Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /workspace

# copy only Maven config first to leverage caching
COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests package

### Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
