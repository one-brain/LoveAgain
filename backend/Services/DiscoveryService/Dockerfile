FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend ./backend
COPY shared ./shared

WORKDIR /src/backend/Services/DiscoveryService
RUN dotnet restore DiscoveryService.csproj
RUN dotnet publish DiscoveryService.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "DiscoveryService.dll"]
