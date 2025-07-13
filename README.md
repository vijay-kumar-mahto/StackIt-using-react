# StackIt - Q&A Forum Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"/>
</div>

<p align="center">
  <strong>A modern, minimal question-and-answer platform built with React, TypeScript, and Node.js</strong>
</p>

<p align="center">
  StackIt enables collaborative learning and structured knowledge sharing with a focus on simplicity and user experience.
</p>

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="screenshots/desktop-home.png" alt="Desktop Home Page" width="250"/>
        <br/>
        <strong>Desktop View</strong>
        <br/>
        <em>Home page with question listing</em>
      </td>
      <td align="center" width="33%">
        <img src="screenshots/mobile-view.png" alt="Mobile View" width="250"/>
        <br/>
        <strong>Mobile View</strong>
        <br/>
        <em>Responsive mobile design</em>
      </td>
      <td align="center" width="33%">
        <img src="screenshots/rich-editor.png" alt="Rich Text Editor" width="250"/>
        <br/>
        <strong>Rich Text Editor</strong>
        <br/>
        <em>Full-featured editor with formatting</em>
      </td>
    </tr>
  </table>
</div>

---

## ✨ Features

### 🔐 Core Functionality
- **User Authentication**
- **Ask Questions**
- **Answer Questions**
- **Tag System**
- **Voting System**
- **Notifications**
- **Responsive Design**

### 📝 Rich Text Editor Features
- **Text Formatting**
- **Lists**
- **Media**
- **Layout**

### 👥 User Roles
| Role | Permissions |
|------|-------------|
| **Guest** | View all questions and answers |
| **User** | Register, login, post questions/answers, vote |
| **Admin** | Moderate content and manage users |

---

## 🛠️ Tech Stack

### Frontend
<table>
  <tr>
    <td><strong>Framework</strong></td>
    <td>React 18 with TypeScript</td>
  </tr>
  <tr>
    <td><strong>Build Tool</strong></td>
    <td>Vite</td>
  </tr>
  <tr>
    <td><strong>Styling</strong></td>
    <td>Tailwind CSS</td>
  </tr>
  <tr>
    <td><strong>Text Editor</strong></td>
    <td>TipTap</td>
  </tr>
  <tr>
    <td><strong>Routing</strong></td>
    <td>React Router</td>
  </tr>
  <tr>
    <td><strong>Form Handling</strong></td>
    <td>React Hook Form with Zod validation</td>
  </tr>
  <tr>
    <td><strong>HTTP Client</strong></td>
    <td>Axios</td>
  </tr>
  <tr>
    <td><strong>Icons</strong></td>
    <td>Lucide React</td>
  </tr>
</table>

### Backend
<table>
  <tr>
    <td><strong>Runtime</strong></td>
    <td>Node.js with Express</td>
  </tr>
  <tr>
    <td><strong>Language</strong></td>
    <td>TypeScript</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>SQLite</td>
  </tr>
  <tr>
    <td><strong>Authentication</strong></td>
    <td>JWT with bcryptjs</td>
  </tr>
  <tr>
    <td><strong>Security</strong></td>
    <td>Express Rate Limiting, Helmet</td>
  </tr>
</table>

---


### Installation

For detailed installation instructions, please refer to our comprehensive [Installation Guide](./installation/INSTALL.md).

**Quick Setup:**
```bash
# Clone the repository
git clone https://github.com/vijay-kumar-mahto/stackit.git
cd stackit

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run client:dev` | Start only the frontend development server |
| `npm run server:dev` | Start only the backend development server |
| `npm run build` | Build the frontend for production |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
StackIt/
├── 📁 backend/                 # Backend source code
│   ├── 📁 database/           # Database setup and models
│   ├── 📁 middleware/         # Express middleware
│   ├── 📁 routes/            # API routes
│   └── 📄 index.ts           # Server entry point
├── 📁 installation/       # Detailed installation guide
├── 📁 src/                   # Frontend source code
│   ├── 📁 components/        # Reusable React components
│   ├── 📁 contexts/          # React contexts (Auth, etc.)
│   ├── 📁 pages/             # Page components
│   └── 📄 main.tsx          # Frontend entry point
├── 📁 screenshots/           # Project screenshots
├── 📄 package.json         # Dependencies and scripts
└── 📄 README.md            # This file
```

---

<div align="center">
  <p>
    <a href="#top">Back to Top ⬆️</a>
  </p>
</div>