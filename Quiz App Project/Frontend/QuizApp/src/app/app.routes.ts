import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Main } from './pages/main/main';
import { AuthGuard } from './guard/auth-guard';
import { TeacherDashboard } from './pages/teacher-dashboard/teacher-dashboard';
import { CreateQuiz } from './pages/create-quiz/create-quiz';
import { RedirectGuard } from './guard/redirect-guard-guard';
import { UploadedQuizzes } from './pages/uploaded-quizzes/uploaded-quizzes';
import { ViewQuizTeacher } from './pages/view-quiz-teacher/view-quiz-teacher';
import { StudentDashboard } from './pages/student-dashboard/student-dashboard';
import { Quizzes } from './pages/quizzes/quizzes';
import { QuizHistory } from './pages/quiz-history/quiz-history';
import { ViewQuizStudent } from './pages/view-quiz-student/view-quiz-student';
import { AttemptQuiz } from './pages/attempt-quiz/attempt-quiz';
import { DisplayQuestions } from './components/display-questions/display-questions';
import { ViewCompletedQuiz } from './components/view-completed-quiz/view-completed-quiz';
import { LeaderBoard } from './pages/leader-board/leader-board';
// import { Notifications } from './pages/notifications/notifications';

export const routes: Routes = [
  { path: '', component: Login, canActivate: [RedirectGuard] },
  { path: 'register', component: Register, canActivate: [RedirectGuard] },

  {
    path: 'main',
    component: Main,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'teacher-dashboard',
        component: TeacherDashboard,
        data: { roles: ['Teacher'] },
      },
      {
        path: 'create-quiz',
        component: CreateQuiz,
        data: { roles: ['Teacher'] },
      },
      {
        path: 'uploaded-quizzes',
        component: UploadedQuizzes,
        data: { roles: ['Teacher'] },
      },
      {
        path: 'uploaded-quizzes/:id',
        component: ViewQuizTeacher,
        data: { roles: ['Teacher'] },
      },
      { path: '', redirectTo: 'teacher-dashboard', pathMatch: 'full' },

      {
        path: 'student-dashboard',
        component: StudentDashboard,
        data: { roles: ['Student'] },
      },
      {
        path: 'available-quizzes',
        component: Quizzes,
        data: { roles: ['Student'] },
      },
      {
        path: 'quiz-history',
        component: QuizHistory,
        data: { roles: ['Student'] },
      },
      {
        path: 'available-quizzes/:id',
        component: ViewQuizStudent,
        data: { roles: ['Student'] },
      },
      {
        path: 'quiz-history/:id',
        component: ViewCompletedQuiz,
        data: { roles: ['Student'] },
      },
      {
        path: 'leader-board',
        component: LeaderBoard,
        data: { roles: ['Student'] },
      }
    ],
  },

  {
    path: 'attempt-quiz/:id',
    component: AttemptQuiz,
    data: { roles: ['Student'] },
    canActivate:[AuthGuard],
    children: [
      {
        path: 'start-quiz',
        component:DisplayQuestions
      },
    ],
  }
];
