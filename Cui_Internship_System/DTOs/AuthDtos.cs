namespace Cui_Internship_System.DTOs;

public record RegisterDto(string FullName, string Email, string Password, string Role, string? RegistrationNumber);
public record LoginDto(string Email, string Password);
public record AuthResponse(string Token, DateTime ExpiresAt, string Email, string Role);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
