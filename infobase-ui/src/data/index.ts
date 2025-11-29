import type { Question } from "../redux/types";

export const mockQuestions : Question[] = [
    {
    id: 1,
    author: {
      id: 1,
      name: 'David Park', 
      avatar: 'DP', 
      initials: 'DP',
      skills: ['C#', 'java', 'c++'],
      project: "Input Management",
    },
    title: 'Best practices for state management in large React applications?',
    description: 'Our React app is growing and useState/useContext is becoming unwieldy. Should we switch to Redux or are there better alternatives?',
    tags: ['React', 'State Management', 'Redux', 'Architecture'],
    upvotes: 56,
    answers: 12,
    askedAt: '8 days ago',
    lastActivity: '6 days ago'
  },
  {
    id: 2,
    author: {
      id: 1,
      name: 'Rachel Green', 
      avatar: 'RG', 
      initials: 'RG',
      skills: ['C#', 'java', 'c++'],
      project: "Input Management",
    },
    title: 'Handling forms with validation in React - Formik vs React Hook Form?',
    description: 'Comparing form libraries for a new project. Which one should I choose and why?',
    tags: ['React', 'Forms', 'Validation', 'Formik'],
    upvotes: 44,
    answers: 9,
    askedAt: '11 days ago',
    lastActivity: '9 days ago'
  },
  {
    id: 3,
    author: {
      id: 3,
      name: 'Sarah Chen', 
      avatar: 'RC', 
      initials: 'RC',
      skills: ['C#', 'java', 'c++'],
      project: "Input Management",
    },
    title: 'How to implement authentication in React with JWT tokens?',
    description: "I'm building a React application and need to implement secure authentication using JWT tokens. What's the best approach?",
    tags: ['React', 'Authentication', 'JWT', 'Security'],
    upvotes: 42,
    answers: 8,
    askedAt: '7 days ago',
    lastActivity: '6 days ago'
  },
  {
    id: 4,
    author: {
      id: 4,
      name: 'Mike Johnson', 
      avatar: 'MJ', 
      initials: 'MJ',
      skills: ['C#', 'java', 'c++'],
      project: "Input Management",
    },
    title: 'How to optimize React app performance?',
    description: 'My React application is getting slow with large lists. What are the best practices for optimization?',
    tags: ['React', 'Performance', 'Optimization'],
    upvotes: 38,
    answers: 15,
    askedAt: '5 days ago',
    lastActivity: '2 days ago'
  },
  {
    id: 5,
    author: {
      id: 5,
      name: 'Emily Davis', 
      avatar: 'ED', 
      initials: 'ED',
      skills: ['C#', 'java', 'c++'],
      project: "Input Management",
    },
    title: 'Best way to handle API calls in React?',
    description: 'Should I use fetch, axios, or React Query for API calls? What are the pros and cons of each?',
    tags: ['React', 'API', 'HTTP', 'React Query'],
    upvotes: 51,
    answers: 11,
    askedAt: '12 days ago',
    lastActivity: '8 days ago'
  }
];


export const mockUsers = [
  { id: 1, name: 'David Park', email: 'david@example.com', reputation: 1250 },
  { id: 2, name: 'Rachel Green', email: 'rachel@example.com', reputation: 890 },
  { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', reputation: 2100 },
  { id: 4, name: 'Mike Johnson', email: 'mike@example.com', reputation: 450 },
  { id: 5, name: 'Emily Davis', email: 'emily@example.com', reputation: 1680 },
];

export const mockTags = [
  { id: 1, name: 'React', count: 234 },
  { id: 2, name: 'JavaScript', count: 189 },
  { id: 3, name: 'TypeScript', count: 156 },
  { id: 4, name: 'State Management', count: 78 },
  { id: 5, name: 'Redux', count: 92 },
  { id: 6, name: 'Forms', count: 45 },
  { id: 7, name: 'Validation', count: 38 },
  { id: 8, name: 'Authentication', count: 67 },
  { id: 9, name: 'JWT', count: 54 },
  { id: 10, name: 'Security', count: 89 },
];

export const mockAnswers = [
  {
    id: 1,
    questionId: 1,
    author: { name: 'John Doe', initials: 'JD' },
    content: 'I recommend using Redux Toolkit with RTK Query. It provides excellent developer experience and handles most edge cases.',
    upvotes: 23,
    isAccepted: true,
    createdAt: '7 days ago',
  },
  {
    id: 2,
    questionId: 1,
    author: { name: 'Jane Smith', initials: 'JS' },
    content: 'Consider Zustand for simpler state management. It has less boilerplate than Redux and works great for medium-sized apps.',
    upvotes: 18,
    isAccepted: false,
    createdAt: '6 days ago',
  },
];