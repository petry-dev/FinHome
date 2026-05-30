FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["FinHome.Api/FinHome.Api.csproj", "FinHome.Api/"]
COPY ["FinHome.Application/FinHome.Application.csproj", "FinHome.Application/"]
COPY ["FinHome.Domain/FinHome.Domain.csproj", "FinHome.Domain/"]
COPY ["FinHome.Infrastructure/FinHome.Infrastructure.csproj", "FinHome.Infrastructure/"]

RUN dotnet restore "FinHome.Api/FinHome.Api.csproj"

COPY . .

WORKDIR "/src/FinHome.Api"
RUN dotnet publish "FinHome.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080
ENTRYPOINT ["dotnet", "FinHome.Api.dll"]
