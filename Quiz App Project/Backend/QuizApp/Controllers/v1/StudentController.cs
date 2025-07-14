using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Models;

namespace QuizApp.Controllers.v1
{
    [ApiController]
    [Route("api/v{version:apiVersion}/students")]
    [ApiVersion("1.0")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpPost]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentRequestDTO studentDto)
        {
            var student = await _studentService.CreateStudentAsync(studentDto);
            return CreatedAtAction(nameof(GetStudentById), new { id = student.Id }, student);
        }

        [HttpGet]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _studentService.GetAllStudentsAsync();
            return Ok(students);
        }

        [HttpGet("{id}")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> GetStudentById(string id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null)
                return NotFound($"No student found with ID: {id}");

            return Ok(student);
        }

        [HttpGet("byEmail")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> GetStudentByEmail([FromQuery] string email)
        {
            try
            {
                var student = await _studentService.GetByEmailAsync(email);
                return Ok(student);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> UpdateStudent(string id, [FromBody] StudentUpdateRequestDto studentDto)
        {
            try
            {
                var updatedStudent = await _studentService.UpdateStudentAsync(id, studentDto);
                return Ok(updatedStudent);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("delete/{id}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> DeleteStudent(string id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null)
                return NotFound($"No student found with ID: {id}");

            // Soft Delete Logic
            student.Status = "Inactive";
            var updatedStudent = await _studentService.UpdateStudentAsync(id, new StudentUpdateRequestDto
            {
                Name = student.Name,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                HighestQualification = student.HighestQualification,
                Status = "Inactive"
            });

            return Ok(new { Message = $"Student with ID: {id} marked as inactive." });
        }

        [HttpGet("filter")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> FilterStudents(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var students = await _studentService.FilterStudents(search, status, pageNumber, pageSize);
            return Ok(students);
        }
        [HttpGet("sort")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> SortStudents(
            [FromQuery] string sortBy ,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool ascending = true)
        {
            var students = await _studentService.SortStudents(sortBy, pageNumber, pageSize, ascending);
            return Ok(students);
        }
    }
}
