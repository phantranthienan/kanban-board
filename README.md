# MERN Stack Kanban Board

A **full-stack Kanban board application** built with the MERN stack (MongoDB, Express, React, Node.js) to manage tasks and workflows efficiently. This project implements both frontend and backend services, featuring authentication, task management, and drag-and-drop functionality.

---

## 🗂️ File Structure

The project is structured into two main directories: `frontend` and `backend`.

### **Backend** (`/backend`)
The backend is a Node.js application using Express to manage API routes and services.

#### **Details**
- **`config/`**: Contains all configuration-related files like database connections and environment variables.
- **`controllers/`**: Houses the controller logic for handling API routes.
- **`errors/`**: Includes custom error classes and error-handling utilities.
- **`middleware/`**: Contains Express middleware for tasks like authentication.
- **`models/`**: Defines database structure using Mongoose schemas and models.
- **`routes/`**: API route definitions linking endpoints to their controllers.
- **`services/`**: Houses the logic functions to handle incoming data from requests.
- **`utils/`**: Utility functions and helpers for common tasks.
- **`app.ts`**: Configures the Express application, adding middleware and routes.
- **`index.ts`**: The entry point of the backend server, responsible for starting the application.

### **Frontend** (`/frontend`)
The frontend is a React application built with TypeScript and styled using Material-UI. It includes Redux for both local and server states management and utilizes hooks for reusability.

#### **Details**
- **`assets/`**: Contains static files such as images and fonts used in the application.
- **`components/`**: Houses reusable React components.
- **`contexts/`**: Contains React Contexts for managing global state.
- **`hooks/`**: Custom React hooks for reusable logic.
- **`pages/`**: Contains page components.
- **`redux/`**: Manages application state with Redux Toolkit.
- **`themes/`**: Stores Material-UI theme configurations.
- **`types/`**: Includes TypeScript type definitions.
- **`utils/`**: Helper functions.
- **`App.tsx`**: Main React application component containing routing logic.
- **`main.tsx`**: The entry point for the React application.

---

## 🚀 Features

- **Task Management**: Add, edit, and delete tasks in different sections.
- **Drag and Drop**: Seamlessly move tasks across sections.
- **User Authentication**: Secure login and token-based authentication.
- **Real-Time Updates**: Reflect changes instantly across the UI.
- **Responsive Design**: TODO

---

## 🛠️ Technologies Used

### **Frontend**
- **React** (with TypeScript)
- **Redux Toolkit**: State management
- **RTK Query**: Data fetching and caching
- **Material-UI**: Component styling
- **dnd-kit**: Drag-and-drop functionality
- **React Hook Form**: Form handling and validation
- **Zod**: Schema-based validation
- **Vite**: Development server and build tool

### **Backend**
- **Node.js**: Server-side runtime
- **Express.js**: Backend framework
- **MongoDB**: NoSQL database
- **Mongoose**: Object Data Modeling (ODM)
- **JSON Web Tokens (JWT)**: Authentication
- **Zod**: Schema-based validation for request data

---

## 👤 Author

- **Phan Tran Thien An**
- 📧 Email: [phantranthienan1405@gmail.com](mailto:phantranthienan1405@gmail.com)
