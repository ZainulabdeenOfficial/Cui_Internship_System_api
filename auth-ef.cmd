@echo off
REM Helper script to run EF Core commands for AuthDbContext
dotnet ef %* --context AuthDbContext --project Cui_Internship_System\Cui_Internship_System.csproj --startup-project Cui_Internship_System\Cui_Internship_System.csproj
