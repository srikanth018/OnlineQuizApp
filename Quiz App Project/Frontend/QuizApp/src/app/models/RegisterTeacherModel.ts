export class RegisterTeacherModel {
    constructor(
        public name: string='',
        public email: string='',
        public phoneNumber: string='',
        public password: string=''        
    ){}
    static mapTeacherModel(model: RegisterTeacherModel) {
        return {
            name: model.name,
            email: model.email,
            phoneNumber: model.phoneNumber,
            password: model.password
        };
    }
}