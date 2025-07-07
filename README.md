# RealSales Admin

RealSales Admin is a modern, feature-rich admin dashboard for managing personas, modes, industries, roles, products, users, and more. Built with React, Vite, Material UI, and Tailwind CSS, it provides a robust interface for business and manufacturing management workflows.

## Features

- **Authentication & Authorization**: Secure login and registration with JWT-based session management.
- **Persona Management**: Create, edit, and manage AI personas with detailed attributes.
- **Mode Management**: Define and manage interaction modes for various business scenarios.
- **Industry & Role Management**: Organize industries, roles, and assign them to personas or users.
- **Plant & Company Size**: Manage plant sizes and company size categories.
- **Product Management**: Add and categorize products for personas and business logic.
- **Manufacturing Models**: Define and manage manufacturing models.
- **Reports**: Generate and view detailed reports for modes and personas.
- **Users & Sessions**: Administer users, view sessions, and manage user roles.
- **Prompt Management**: Manage prompts for AI-driven workflows.
- **Responsive UI**: Built with Material UI and Tailwind CSS for a modern, responsive experience.

## Tech Stack

- **Frontend**: React 19, Vite, Material UI, Tailwind CSS
- **State & Forms**: React Hook Form, React Context
- **Networking**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Toastify

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jitam-Bharadwaj/Realsales-admin.git
   cd Realsales-admin
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory with the following variable:
     ```env
     VITE_API_URL=<your-backend-api-url>
     ```

### Running the App

- **Development mode:**
  ```bash
  npm run dev
  # or
  yarn dev
  ```
- **Production build:**
  ```bash
  npm run build
  # or
  yarn build
  ```
- **Preview production build:**
  ```bash
  npm run preview
  # or
  yarn preview
  ```

### Linting

Run ESLint to check for code issues:
```bash
npm run lint
# or
yarn lint
```

## Project Structure

- `src/Drawer/` — Main dashboard modules (Persona, Modes, Industry, Role, Product, Reports, Users, etc.)
- `src/Auth/` — Authentication (Login, Register)
- `src/api/` — Axios instance and API endpoints
- `src/components/` — Reusable UI components
- `src/assets/` — Static assets
- `public/` — Public files and images

## Environment Variables

- `VITE_API_URL` — The base URL for the backend API (required)

## License

This project is proprietary and intended for internal use. Contact DESUN TECHNOLOGY PVT LTD the real owner for licensing details.

---

> Built with ❤️ by DESUN TECHNOLOGY PVT LTD.
