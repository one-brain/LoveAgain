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
        var result = await controller.ListProviders(
            q: null,
            specialty: null,
            skillTag: null,
            minRate: null,
            maxRate: null,
            sortBy: null,
            latitude: null,
            longitude: null,
            radiusKm: null,
            page: 1,
            pageSize: 10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<DiscoveryPagedResponse>(okResult.Value);
        Assert.NotNull(response.Items);
        Assert.True(response.IsPublicLimited);
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