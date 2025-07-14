export class Option {
  constructor(
    public id: string = '',
    public optionText: string = '',
    public isCorrect: boolean = false
  ) {}
}

export class Question {
  constructor(
    public id: string = '',
    public questionText: string = '',
    public mark: number = 0,
    public options: Option[] = [],
    public uploadImage: string | null = null
  ) {}
}

export class QuizResponseModel {
  constructor(
    public id: string = '',
    public title: string = '',
    public description: string = '',
    public category: string = '',
    public uploadedBy: string = '',
    public totalMarks: number = 0,
    public timeLimit:string='',
    public questions: Question[] = [],
    public createdAt: string = ''
  ) {}
}
