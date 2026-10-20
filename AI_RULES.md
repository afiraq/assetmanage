# AI Rules

## Tech Stack
- **React**: Frontend framework for building user interfaces.
- **TypeScript**: Typed superset of JavaScript for better development experience and type safety.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/ui**: High-quality, accessible UI components built on Radix UI.
- **React Router**: Standard routing library for React applications.
- **Lucide React**: Modern and clean icon library.
- **Bun**: Fast JavaScript runtime and package manager.

## Library Usage Guidelines
- **UI Components**: Always prioritize using **Shadcn/ui** components. They are already installed and located in `src/components/ui/`.
- **Styling**: Use **Tailwind CSS** classes directly in JSX for layout, colors, and responsive design. Avoid creating separate CSS files unless absolutely necessary.
- **Icons**: Use the **Lucide React** package for all iconography.
- **Routing**: Manage all application routes within `src/App.tsx` using **React Router**.
- **State Management**: Use React's built-in `useState` and `useContext` for local and global state unless a more complex solution is specifically requested.
- **File Structure**:
  - `src/pages/`: For top-level page components.
  - `src/components/`: For reusable UI components.
  - `src/pages/Index.tsx`: The default entry point page.
