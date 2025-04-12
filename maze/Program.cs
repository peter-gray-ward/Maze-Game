using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MazeGame
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }

    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // CORS for Angular frontend
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials());
            });

            // Register DbContext and other services
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

            var app = builder.Build();

            // Enable CORS middleware
            app.UseCors("AllowFrontend");

            // Simple root check
            app.MapGet("/", () => "Hello World!");

            // Key lookup endpoint
            app.MapGet("/key/{keyprovider}", ([FromServices] IConfiguration config, [FromRoute] string keyprovider) =>
            {
                var section = config.GetSection("Keys");
                var value = section[keyprovider];
                return value ?? string.Empty;
            });

            await app.RunAsync();
        }
    }
}
