---
description: "Frontend development rules for React (Vite), TypeScript, Tailwind, and Shadcn UI."
globs: "**/*"
alwaysApply: false
---

You are an expert in React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Radix UI, React Query, Zustand, and modern frontend architecture.

# Key Principles

- Write concise, production-ready TypeScript code
- Prefer functional components only (no classes)
- Use modular and reusable component design
- Keep components small and single-responsibility
- Use descriptive variable names (e.g., isLoading, hasError)
- Prefer composition over duplication
- Use absolute imports with `@/` alias
- Use named exports for components

---

# TypeScript Rules

- Always use TypeScript (no plain JS)
- Prefer interfaces over types for objects
- Avoid enums — use constant maps instead
- Avoid unnecessary type assertions (`as`)
- Define types close to usage when possible

---

# React Rules

- Use functional components only
- Use `function ComponentName()` syntax (no const arrow components)
- Keep logic outside JSX
- Avoid unnecessary `useState` — prefer derived state
- Use `useMemo` and `useCallback` only when necessary
- Minimize `useEffect` usage; prefer computed values

---

# State Management

- Use Zustand for global state
- Use React Query for server state
- Avoid duplicating server state in local state

---

# API & Data Fetching

- Use a dedicated `/services` layer for API calls
- Use Axios or fetch wrapper
- Handle errors in services layer and return user-friendly messages
- React Query handles caching, loading, and retries

---

# Project Structure

Use this structure:

src/
  app/
  components/
    ui/
    common/
  features/
    auth/
    doctors/
    appointments/
    patients/
  hooks/
  lib/
  services/
  store/
  types/
  utils/
  routes/

---

# Shadcn UI Rules

- Use Shadcn UI components as base building blocks
- Extend, do not rewrite components
- Keep styling consistent using Tailwind tokens
- Avoid inline styles

---

# Tailwind Rules

- Use utility-first approach
- Avoid custom CSS unless necessary
- Use consistent spacing system
- Mobile-first responsive design
- Avoid arbitrary values unless required

---

# Code Style Rules

- Use early returns for logic
- Avoid nested ternaries
- Keep JSX clean and readable
- Extract reusable UI into components
- Avoid logic inside JSX return

---

# Performance Rules

- Lazy load pages using dynamic import
- Avoid unnecessary re-renders
- Use React.memo only when needed
- Optimize images (WebP, lazy loading)

---

# Error Handling

- Show user-friendly error messages
- Never expose raw backend errors to UI
- Handle loading, empty, and error states for all pages

---

# UI/UX Rules

- Prioritize clarity over complexity
- Use consistent spacing and typography
- Use skeleton loaders for loading states
- Ensure responsive design on all pages
- Keep healthcare UI calm, minimal, and trustworthy

---

# Development Philosophy

- Build small, reusable UI blocks
- Prefer simplicity over over-engineering
- Focus on clean UX flows (especially booking and consultation)
- Ensure all features are understandable in 3 clicks or less