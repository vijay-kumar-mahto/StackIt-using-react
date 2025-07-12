# StackIt - Q&A Forum Platform

A modern, minimal question-and-answer platform built with React, TypeScript, and Node.js. StackIt enables collaborative learning and structured knowledge sharing with a focus on simplicity and user experience.

## Features

### Core Functionality
- **User Authentication**: Guest viewing, user registration/login, and admin roles
- **Ask Questions**: Rich text editor with formatting, links, images, and lists
- **Answer Questions**: Comprehensive answer system with voting and acceptance
- **Tag System**: Categorize questions with multi-select tags
- **Voting System**: Upvote/downvote questions and answers
- **Notifications**: Real-time notifications for interactions
- **Responsive Design**: Mobile-first design matching provided mockups

### Rich Text Editor Features
- Bold, Italic, Strikethrough formatting
- Numbered and bullet lists
- Hyperlink insertion
- Image upload support
- Text alignment (Left, Center, Right)

### User Roles
- **Guest**: View all questions and answers
- **User**: Register, login, post questions/answers, vote
- **Admin**: Moderate content and manage users

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **TipTap** for rich text editing
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express Rate Limiting** for security
- **Helmet** for security headers

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both the frontend (port 5173) and backend (port 3001) concurrently.

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client:dev` - Start only the frontend development server
- `npm run server:dev` - Start only the backend development server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint

## Project Structure

```
StackIt/
├── backend/                 # Backend source code
│   ├── database/           # Database setup and models
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   └── index.ts           # Server entry point
├── src/                   # Frontend source code
│   ├── components/        # Reusable React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── pages/             # Page components
│   └── main.tsx          # Frontend entry point
└── package.json         # Dependencies and scripts
```

## Features Implemented

✅ **Home Page**: Question listing with search, filtering, and pagination
✅ **Ask Question Page**: Rich text editor with tag system
✅ **Question Detail Page**: View questions, answers, and voting
✅ **User Authentication**: Login, register, and protected routes
✅ **Voting System**: Upvote/downvote questions and answers
✅ **Rich Text Editor**: Full formatting capabilities with TipTap
✅ **Tag System**: Question categorization
✅ **Notifications**: Real-time notification system
✅ **Responsive Design**: Mobile-first design
✅ **User Profiles**: View user activity and statistics

## Usage

1. **Browse Questions**: Visit the home page to see all questions
2. **Register/Login**: Create an account or sign in to participate
3. **Ask Questions**: Use the rich text editor to post detailed questions
4. **Answer Questions**: Provide helpful answers with formatting
5. **Vote**: Upvote or downvote questions and answers
6. **Accept Answers**: Question authors can accept the best answer
7. **Tag Questions**: Categorize questions with relevant tags
8. **Get Notifications**: Receive notifications for interactions
