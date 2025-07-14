using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using QuizApp.Models;
using Serilog;

namespace QuizApp.Misc
{
    public class CustomException : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            var exception = context.Exception;
            var errorId = Guid.NewGuid();
            var request = context.HttpContext.Request;

            CustomError customError = new()
            {
                ErrorId = errorId
            };

            int statusCode;
            string logMessage;

            if (exception is DbUpdateException dbUpdateEx &&
                dbUpdateEx.InnerException is PostgresException pgEx &&
                pgEx.SqlState == "23505")
            {
                statusCode = 409; 
                logMessage = "Duplicate key violation";
                customError.Message = "The provided email already exists. Please use a different email.";
            }
            else
            {
                // Your existing switch for other cases:
                switch (exception)
                {
                    case InvalidOperationException:
                        statusCode = 400;
                        logMessage = "Bad request";
                        customError.Message = exception.Message;
                        break;

                    case ArgumentNullException or ArgumentException:
                        statusCode = 400;
                        logMessage = "Invalid argument provided";
                        customError.Message = exception.Message;
                        break;

                    case UnauthorizedAccessException:
                        statusCode = 401;
                        logMessage = "Unauthorized";
                        customError.Message = "Authentication is required to access this resource.";
                        break;

                    case KeyNotFoundException:
                        statusCode = 404;
                        logMessage = "Resource not found";
                        customError.Message = exception.Message;
                        break;

                    case TimeoutException:
                        statusCode = 408;
                        logMessage = "Request timeout";
                        customError.Message = "The request timed out. Please try again later.";
                        break;

                    case NotImplementedException:
                        statusCode = 501;
                        logMessage = "Not implemented";
                        customError.Message = "This feature is not implemented.";
                        break;

                    case NotSupportedException:
                        statusCode = 415;
                        logMessage = "Unsupported operation or media type";
                        customError.Message = "The request is in an unsupported format.";
                        break;

                    default:
                        statusCode = 500;
                        logMessage = "Unhandled exception";
                        customError.Message = exception.Message;
                        break;
                }
            }

            customError.StatusCode = statusCode;

            // Logging
            if (statusCode >= 500)
                Log.Error(exception, "{LogMessage} | ErrorID: {ErrorID} | Path: {Path} | Method: {Method} | {CustomErrorMessage}",
                    logMessage, errorId, request.Path, request.Method, customError.Message);
            else
                Log.Warning(exception, "{LogMessage} | ErrorID: {ErrorID} | Path: {Path} | Method: {Method} | {CustomErrorMessage}",
                    logMessage, errorId, request.Path, request.Method, customError.Message);

            context.Result = new ObjectResult(customError)
            {
                StatusCode = statusCode
            };

            context.ExceptionHandled = true;
        }
    }
}
