# Multi-stage Docker build for Spring Boot Backend on Render
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy backend files
COPY backend /app/backend

# Build the complaint-service jar
RUN cd /app/backend/complaint-service && ../mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/backend/complaint-service/target/complaint-service.jar app.jar

# Render assigns dynamic port via PORT environment variable
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
