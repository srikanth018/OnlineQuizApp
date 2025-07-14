import { Quiz } from "./QuizModel";

export class CompletedQuiz {
  constructor(
    public id: string = "",
    public totalScore: number = 0,
    public studentEmail: string = "",
    public quizId: string = "",
    public student: any = null,
    public startedAt: string = "",
    public endedAt: string = "",
    public createdAt: string = "",
    public quizData: Quiz = new Quiz(),
    public creditPoints: number = 0,
  ) {}
}

