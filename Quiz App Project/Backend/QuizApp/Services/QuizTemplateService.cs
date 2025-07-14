using ClosedXML.Excel;
using QuizApp.Interfaces;

namespace QuizApp.Services
{
    public class QuizTemplateService : IQuizTemplateService
    {
        public byte[] GenerateQuizTemplate(int questionCount, int optionCount = 4)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("QuizTemplate");

            // Header Row
            int col = 1;
            // worksheet.Cell(1, col++).Value = "Title";
            // worksheet.Cell(1, col++).Value = "Category";
            // worksheet.Cell(1, col++).Value = "UploadedBy";
            // worksheet.Cell(1, col++).Value = "TotalMarks";
            worksheet.Cell(1, col++).Value = "QuestionText";
            worksheet.Cell(1, col++).Value = "Mark";

            for (int i = 1; i <= optionCount; i++)
            {
                worksheet.Cell(1, col++).Value = $"Option{i}";
                worksheet.Cell(1, col++).Value = $"IsCorrect{i}";
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }

}