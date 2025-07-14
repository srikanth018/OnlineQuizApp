export class Quiz {
  constructor(
    public id:string='',
    public title: string = '',
    public description: string = '',
    public category: string = '',
    public uploadedBy: string = '',
    public totalMarks: number = 0,
    public timeLimit:string='',
    public questions:any = {},
    public createdAt: string = ''

  ) {}
}

