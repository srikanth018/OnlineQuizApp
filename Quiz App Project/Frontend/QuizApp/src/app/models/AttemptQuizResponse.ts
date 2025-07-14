export class OptionForAttempt {
  constructor(
    public optionId: string = '',
    public optionText: string = ''
  ) {}
}

export class QuestionForAttempt {
  constructor(
    public questionId: string = '',
    public questionText: string = '',
    public imageUrl: string | null = null,
    public options: OptionForAttempt[] = []
  ) {}
}

export class AttemptQuizResponse {
  constructor(
    public quizId: string = '',
    public title: string = '',
    public timeLimit: string = '', // or use number for minutes if easier
    public questions: QuestionForAttempt[] = []
  ) {}
}
