# Project Architecture: Meshly

Meshly is a client-side React application built with Vite and TypeScript, designed to provide a responsive and interactive user experience.

## Core Technologies

-   **React**: A JavaScript library for building user interfaces.
-   **Vite**: A fast build tool that provides a lightning-fast development experience.
-   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
-   **ESLint**: A linter to enforce code quality and consistency, configured with React best practices.

## Directory Structure

-   `src/`: Contains the main application source code.
    -   `App.tsx`: The root component of the application.
    -   `main.tsx`: Entry point for rendering the React application.
    -   `index.css`: Global styles.
    -   `components/`: Reusable UI components.
        -   `Header.tsx`: Application header.
        -   `Sidebar.tsx`: Main sidebar containing various controls.
        -   `GradientCanvas.tsx`: Component responsible for rendering the gradient.
        -   `ExportModal.tsx`: Modal for exporting generated assets.
        -   `sidebar/`: Sub-components specific to the sidebar.
            -   `CanvasSection.tsx`: Controls related to the canvas.
            -   `ColorSection.tsx`: Controls for color adjustments.
            -   `FilterSection.tsx`: Controls for applying filters.
    -   `types/`: TypeScript type definitions.
        -   `gradient.ts`: Type definitions related to gradients.

## Data Flow and State Management

(Details on state management, data flow, and any context APIs or libraries used would go here.)

## Component Hierarchy

(A high-level overview or diagram of how components interact would be useful here.)

## Build and Development Process

-   **Development**: Vite provides hot module reloading for a smooth development workflow.
-   **Building**: The application is bundled for production using Vite, optimizing for performance and size.