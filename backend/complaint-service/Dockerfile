# Multi-stage Docker build for Spring Boot Backend on Render
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy parent and module pom files
COPY pom.xml /app/pom.xml
COPY complaint-service /app/complaint-service

# Build using maven
RUN mvn clean package -DskipTests -f /app/complaint-service/pom.xml

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /app/complaint-service/target/complaint-service.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
