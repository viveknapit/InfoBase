import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import QuestionsPage from '../pages/QuestionsPage';
import ViewQuestionPage from '../pages/ViewQuestionPage';
import LoginPage from '../pages/LoginPage';
//import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {path: "/login",
   element: <LoginPage />
  },
  {
    path: "/",
    element:<MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/question", element: <QuestionsPage /> },
      {path: "/questions/:id", element: <ViewQuestionPage />},
    ],
  },
]);

export default router;