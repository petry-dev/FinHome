using FinHome.Domain.Enums;

namespace FinHome.Application.Features.Categories;

public record CategoryDto(int Id, string Name, PurposeType Purpose);
