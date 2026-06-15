# Stage 1: Base Runtime Environment
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5115
ENV ASPNETCORE_URLS=http://+:5115
ENV ASPNETCORE_ENVIRONMENT=Development

# Stage 2: SDK Image for compilation
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies to cache layer
COPY ["MasaTakip.API/MasaTakip.API.csproj", "MasaTakip.API/"]
COPY ["MasaTakip.Application/MasaTakip.Application.csproj", "MasaTakip.Application/"]
COPY ["MasaTakip.Domain/MasaTakip.Domain.csproj", "MasaTakip.Domain/"]
COPY ["MasaTakip.Infrastructure/MasaTakip.Infrastructure.csproj", "MasaTakip.Infrastructure/"]

RUN dotnet restore "MasaTakip.API/MasaTakip.API.csproj"

# Copy all files and compile
COPY . .
WORKDIR "/src/MasaTakip.API"
RUN dotnet build "MasaTakip.API.csproj" -c Release -o /app/build

# Stage 3: Publishing
FROM build AS publish
RUN dotnet publish "MasaTakip.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Run
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MasaTakip.API.dll"]
