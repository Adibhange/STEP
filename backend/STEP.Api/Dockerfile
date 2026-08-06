# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first, in its own layer, so editing source later doesn't invalidate the restore cache.
COPY STEP.sln .
COPY STEP.Domain/*.csproj STEP.Domain/
COPY STEP.Application/*.csproj STEP.Application/
COPY STEP.Persistence/*.csproj STEP.Persistence/
COPY STEP.Infrastructure/*.csproj STEP.Infrastructure/
COPY STEP.Api/*.csproj STEP.Api/
RUN dotnet restore STEP.sln

COPY . .
WORKDIR /src/STEP.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# DB_CONNECTION, JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, ALLOWED_ORIGINS must be supplied at
# container run time (env vars, --env-file, or your orchestrator's secret manager) — this image
# intentionally ships with no .env baked in. The app fails fast at startup if DB_CONNECTION or
# JWT_SECRET is missing rather than falling back to an insecure default (see Program.cs).
ENV ASPNETCORE_URLS=http://+:5125
EXPOSE 5125
ENTRYPOINT ["dotnet", "STEP.Api.dll"]
