using Cue.Infrastructure.Data;
using DiscoveryService.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DiscoveryService.Tests;

public class DiscoveryControllerTests
{
    private static CueDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<CueDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new CueDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task ListProviders_ReturnsProviderCards()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var controller = new DiscoveryController(dbContext);

        // Act
        var result = await controller.ListProviders(null, null, null, null, null, 1, 10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var cards = Assert.IsAssignableFrom<IReadOnlyList<ProviderCardResponse>>(okResult.Value);
    }

    [Fact]
    public async Task GetProvider_ReturnsNotFound_WhenProviderDoesNotExist()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var controller = new DiscoveryController(dbContext);
        var nonexistentId = Guid.NewGuid();

        // Act
        var result = await controller.GetProvider(nonexistentId);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}