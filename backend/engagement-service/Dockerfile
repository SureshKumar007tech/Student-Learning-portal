FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/ backend/
RUN mvn -B -f backend/pom.xml -pl engagement-service -am -DskipTests package

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends python3-minimal \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /workspace/backend/engagement-service/target/engagement-service-1.0.0.jar /app/app.jar
COPY backend/start-render.sh /app/start-render.sh
EXPOSE 10000
ENTRYPOINT ["/bin/sh", "/app/start-render.sh"]
