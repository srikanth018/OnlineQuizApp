using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using Serilog;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.Extensions.Options;
using QuizApp.Interfaces;
using QuizApp.Services;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.Misc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuizApp.Hubs;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Logging
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day,
                   outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .Enrich.FromLogContext()
    .MinimumLevel.Debug()
    .CreateLogger();
builder.Host.UseSerilog();


builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("FixedPolicy", opt =>
    {
        opt.Window = TimeSpan.FromHours(1);    // Time window of 1 hour
        opt.PermitLimit = 1000;                   // Allow 100 requests per hour
        opt.QueueLimit = 2;                      // Queue limit of 2
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Configure(builder.Configuration.GetSection("Kestrel"));
});


#region Repositories
builder.Services.AddTransient<IRepository<string, Teacher>, TeacherRepository>();
builder.Services.AddTransient<IRepository<string, User>, UserRepository>();
builder.Services.AddTransient<IRepository<string, Quiz>, QuizRepository>();
builder.Services.AddTransient<IRepository<string, Question>, QuestionRepository>();
builder.Services.AddTransient<IRepository<string, Option>, OptionRepository>();
builder.Services.AddTransient<IRepository<string, Student>, StudentRepository>();
builder.Services.AddTransient<IRepository<string, CompletedQuiz>, CompletedQuizRepository>();
#endregion


#region Services
builder.Services.AddTransient<ITeacherService, TeacherService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IAuthenticateService, AuthenticationService>();
builder.Services.AddTransient<ITokenService, TokenService>();
builder.Services.AddTransient<IQuizService, QuizService>();
builder.Services.AddTransient<IQuizTemplateService, QuizTemplateService>();
builder.Services.AddTransient<IAttemptQuizService, AttemptQuizService>();
builder.Services.AddTransient<IStudentService, StudentService>();
builder.Services.AddTransient<IAttemptQuizService, AttemptQuizService>();
builder.Services.AddTransient<ICompletedQuizService, CompletedQuizService>();
#endregion

#region Filters
builder.Services.AddScoped<ITransaction, Transaction>();

builder.Services.AddScoped<TransactionFilter>();
builder.Services.AddScoped<CustomException>();
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<TransactionFilter>();
    options.Filters.Add<CustomException>();
}).AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.MaxDepth = 64;
    });

#endregion


builder.Services.AddDbContext<QuizAppContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    opt.EnableSensitiveDataLogging();
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddMvc().AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "QuizApp API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAll", policy =>
//     {
//         policy.AllowAnyOrigin()   
//               .AllowAnyHeader()
//               .AllowAnyMethod();
//     });
// });



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR(); 





#region AuthenticationFilter
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false,
                        ValidateIssuer = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Keys:JwtTokenKey"]))
                    };
                });
#endregion
builder.Services.AddAuthorization();










var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
        foreach (var desc in provider.ApiVersionDescriptions)
        {
            options.SwaggerEndpoint($"/swagger/{desc.GroupName}/swagger.json", desc.GroupName.ToUpperInvariant());
        }
    });
}



app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseCors("AllowAngularApp");
app.MapHub<QuizHub>("/quizhub"); 
app.UseRateLimiter();
app.Run();

