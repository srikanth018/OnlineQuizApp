export class RegisterStudentModel {
    constructor(
        public name: string='',
        public email: string='',
        public phoneNumber: string='',
        public highestQualification: string='',
        public dateOfBirth: string='',
        public password: string=''        
    ){}

    static mapStudentModel(model: RegisterStudentModel) {
        return {
            name: model.name,
            email: model.email,
            phoneNumber: model.phoneNumber,
            highestQualification: model.highestQualification,
            dateOfBirth: model.dateOfBirth,
            password: model.password
        };
    }
}