namespace Cui_Internship_System.DTOs;

public record CreateGradeDto(int InternshipId, string Component, decimal Score, decimal MaxScore, string? Comments);
public record UpdateGradeDto(decimal Score, decimal MaxScore, string? Comments);
