using Microsoft.EntityFrameworkCore;
using QuizApp.Models;

namespace QuizApp.Contexts
{
    public class QuizAppContext : DbContext
    {
        public QuizAppContext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<CompletedQuiz> CompletedQuizzes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Keys
            modelBuilder.Entity<User>().HasKey(u => u.Email).HasName("PK_Users");
            modelBuilder.Entity<Teacher>().HasKey(t => t.Id).HasName("PK_Teachers");
            modelBuilder.Entity<Student>().HasKey(s => s.Id).HasName("PK_Students");
            modelBuilder.Entity<Question>().HasKey(q => q.Id).HasName("PK_Questions");
            modelBuilder.Entity<Option>().HasKey(o => o.Id).HasName("PK_Options");
            modelBuilder.Entity<CompletedQuiz>().HasKey(cq => cq.Id).HasName("PK_CompletedQuizzes");
            modelBuilder.Entity<Quiz>().HasKey(q => q.Id).HasName("PK_Quizzes");

            // User - Teacher (One-to-One)
            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.User)
                .WithOne(u => u.Teacher)
                .HasForeignKey<Teacher>(t => t.Email)
                .HasConstraintName("FK_Teacher_User");

            // User - Student (One-to-One)
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.Email)
                .HasConstraintName("FK_Student_User");

            modelBuilder.Entity<Teacher>()
                .HasAlternateKey(t => t.Email)
                .HasName("AK_Teacher_Email");

            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Teacher)
                .WithMany(t => t.Quizzes)
                .HasForeignKey(q => q.UploadedBy)   // Quiz.UploadedBy is the FK
                .HasPrincipalKey(t => t.Email)      // Teacher.Email is the PK on the principal side for FK
                .HasConstraintName("FK_Quiz_Teacher_Email");

            // Teacher - Quiz (One-to-Many)
            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Teacher)
                .WithMany(t => t.Quizzes)
                .HasForeignKey(q => q.UploadedBy)
                .HasConstraintName("FK_Quiz_Teacher");

            // Quiz - Questions (One-to-Many)
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Quiz)
                .WithMany(quiz => quiz.Questions)
                .HasForeignKey(q => q.QuizId)
                .HasConstraintName("FK_Question_Quiz");

            // Question - Options (One-to-Many)
            modelBuilder.Entity<Option>()
                .HasOne(o => o.question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .HasConstraintName("FK_Option_Question");

            // Student - CompletedQuiz (One-to-Many)
            modelBuilder.Entity<CompletedQuiz>()
                .HasOne(cq => cq.Student)
                .WithMany(s => s.CompletedQuizzes)
                .HasForeignKey(cq => cq.StudentEmail)
                .HasPrincipalKey(s => s.Email) // Student.Email is the PK on the principal side for FK
                .HasConstraintName("FK_CompletedQuiz_Student");
        }

    }
}