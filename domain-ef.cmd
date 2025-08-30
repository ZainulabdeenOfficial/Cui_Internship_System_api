@echo off
REM Helper script to run EF Core commands for DomainDbContext
dotnet ef %* --context DomainDbContext --project Cui_Internship_System\Cui_Internship_System.csproj --startup-project Cui_Internship_System\Cui_Internship_System.csproj
