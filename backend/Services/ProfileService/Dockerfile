FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props* ./
COPY backend ./backend
COPY shared ./shared

WORKDIR /src/backend/Services/ProfileService
RUN dotnet restore ProfileService.csproj
RUN dotnet publish ProfileService.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_gcServer=0 \
    DOTNET_gcConcurrent=1 \
    DOTNET_GCDynamicAdaptationMode=1 \
    DOTNET_EnableDiagnostics=0
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ProfileService.dll"]
