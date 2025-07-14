export class QuizResponseMapper {
  static mapResponseToQuiz(response: any): any {
    return {
      id: response.id || '',
      title: response.title || '',
      description: response.description || '',
      category: response.category || '',
      uploadedBy: response.uploadedBy || '',
      totalMarks: response.totalMarks || 0,
      createdAt: response.createdAt || '',
      timeLimit: response.timeLimit || '',
      questions: (response.questions?.$values || []).map((q: any) =>
        this.questionMapper(q)
      ),
    };
  }

  static questionMapper(question: any): any {
    return {
      id: question.id || '',
      questionText: question.questionText || '',
      mark: question.mark || 0,
      options: (question.options?.$values || []).map((opt: any) =>
        this.optionMapper(opt)
      ),
      uploadImage: question.uploadImage || null,
    };
  }

  static optionMapper(option: any): any {
    return {
      id: option.id || '',
      optionText: option.optionText || '',
      isCorrect: option.isCorrect || false,
    };
  }
}
