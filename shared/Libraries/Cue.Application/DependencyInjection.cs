using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Cue.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddCueApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration => configuration.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}