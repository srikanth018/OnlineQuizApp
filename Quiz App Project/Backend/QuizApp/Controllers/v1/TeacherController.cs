using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Controllers.v1
{
    [ApiController]
    [Route("api/v{version:apiVersion}/teachers")]
    [ApiVersion("1.0")]

    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeacherController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        // Create a new teacher
        [HttpPost]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequestDTO teacher)
        {
            var createdTeacher = await _teacherService.CreateTeacherAsync(teacher);
            return CreatedAtAction(nameof(GetTeacherById), new { id = createdTeacher.Id, version = "1.0" }, createdTeacher);
        }

        // Get all teachers
        [HttpGet]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _teacherService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        // Get teacher by Id
        [HttpGet("{id}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetTeacherById(string id)
        {
            var teacher = await _teacherService.GetTeacherByIdAsync(id);
            if (teacher == null)
                return NotFound($"Teacher with id {id} not found.");
            return Ok(teacher);
        }

        // Get teacher by Email
        [HttpGet("byEmail")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]

        public async Task<IActionResult> GetTeacherByEmail([FromQuery] string email)
        {
            var teacher = await _teacherService.GetByEmailAsync(email);
            return Ok(teacher);
        }

        // Update teacher
        [HttpPut("{id}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]

        public async Task<IActionResult> UpdateTeacher(string id, [FromBody] TeacherUpdateRequestDTO teacher)
        {
            var updatedTeacher = await _teacherService.UpdateTeacherAsync(id, teacher);
            return Ok(updatedTeacher);
        }

        // Delete teacher (soft/hard based on your repository)
        [HttpPut("delete/{id}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        public async Task<Teacher> DeleteTeacherAsync(string id)
        {
            var deleteTeacher = await _teacherService.GetTeacherByIdAsync(id);
            if (deleteTeacher == null)
            {
                throw new KeyNotFoundException($"Teacher not found with the provided id - {id} for delete");
            }
            var updateStatus = new TeacherUpdateRequestDTO
            {
                Status = "Inactive"
            };
            return await _teacherService.UpdateTeacherAsync(id, updateStatus);
        }

        [HttpGet("filter")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> FilterTeachers([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var filteredTeachers = await _teacherService.FilterTeachers(search, status, pageNumber, pageSize);
            return Ok(filteredTeachers);
        }
        [HttpGet("sort")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<IActionResult> SortTeachers([FromQuery] string sortBy, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] bool ascending = true)
        {
            var sortedTeachers = await _teacherService.SortTeachers(sortBy, pageNumber, pageSize, ascending);
            return Ok(sortedTeachers);
        }
    }
}
