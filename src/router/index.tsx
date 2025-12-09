import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import ViewQuestionPage from '../pages/ViewQuestionPage';
import LoginPage from '../pages/LoginPage';
import AskQuestionPage from '../pages/AskQuestionPage';
import ProtectedRoute from './ProtectedRoute';
import MyQuestionsPage from '../pages/MyQuestionPage';

const router = createBrowserRouter([
  {path: "/login",
   element:<LoginPage />
  },
  {
    path: "/",
    element:<ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/ask", element: <AskQuestionPage /> },
      {path: "/question/:id", element: <ViewQuestionPage />},
      {path: "/question/me", element: <MyQuestionsPage />},
    ],
  },
]);

export default router;