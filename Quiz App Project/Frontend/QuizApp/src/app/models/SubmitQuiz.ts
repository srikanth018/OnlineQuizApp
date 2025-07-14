export class SubmitQuiz{
    constructor(
        public quizId:string ='',
        public studentEmail:string='',
        public questions:QuestionsArray[] = [],
        public startedAt:string='',
        public endedAt:string='',
        public negativePoints:number = 0,
    ){}
}
export class QuestionsArray{
    constructor(
        public questionId:string ='',
        public selectedOptionIds:string[]=[],
    ){}
}