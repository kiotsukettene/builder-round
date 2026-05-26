---
description: "Backend development rules for Node.js, Express, TypeScript, Prisma, and PostgreSQL (Neon)."
globs: "**/*"
alwaysApply: false
---

You are an expert in Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon), and backend system design.

# Core Architecture Principles

- Use feature-based modular architecture (modules per domain: auth, doctors, patients, appointments)
- Follow Controller → Service → Repository pattern strictly
- Each layer must have a single responsibility (SOLID principle)
- Avoid business logic inside controllers
- Avoid database queries outside repositories
- Keep services pure and reusable
- Prefer composition over inheritance
- Enforce DRY principles across modules

---

# Folder Structure Rules

Use this structure:

src/
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.validation.ts

    doctors/
    patients/
    appointments/

  middleware/
  utils/
  lib/
  errors/
  config/

---

# TypeScript Rules

- Always use TypeScript (strict mode enabled)
- Prefer interfaces over types for objects
- Avoid enums — use constant objects instead
- Use explicit return types for services and repositories
- Avoid `any` unless absolutely necessary
- Use DTOs for all inputs and outputs

---

# Express Rules

- Use `express.Router()` per module
- Keep routes thin and declarative
- Never write business logic in routes
- Use asyncHandler wrapper for all async routes
- Use middleware for cross-cutting concerns

---

# Service Layer Rules

- All business logic must live in services
- Services must not depend on Express (no req/res objects)
- Services must be reusable and framework-agnostic
- Services should throw domain errors, not HTTP responses

---

# Repository Layer Rules

- Only database operations allowed here
- Use Prisma client exclusively for DB access
- No business logic in repositories
- Return raw data or null (no formatting)

---

# Error Handling Rules

- Use a centralized error class (AppError)
- Use global error middleware for responses
- Separate developer errors and client-safe messages
- Never expose stack traces to clients
- Use consistent error response format:

{
  success: false,
  message: string
}

- Use asyncHandler wrapper to eliminate try/catch in controllers

---

# Security Rules

- Always use helmet middleware
- Enable CORS with strict origin rules
- Use express-rate-limit for API protection
- Hash passwords using bcryptjs
- Store secrets in environment variables only
- Never expose sensitive data in responses

---

# Rate Limiting Rules

- Apply global rate limiter to all routes
- Configure limits per IP
- Return user-friendly message when limit is exceeded
- Prevent brute-force login attempts using stricter limits on auth routes

---

# Authentication Rules

- Use JWT for authentication
- Store tokens securely (httpOnly cookies preferred if applicable)
- Use middleware for protected routes
- Implement role-based access control (PATIENT | DOCTOR)
- Never trust client-provided role values

---

# Prisma Rules

- Keep Prisma client inside `src/lib/prisma.ts`
- Never instantiate multiple Prisma clients
- Use migrations for all schema changes
- Use relational modeling for ERD consistency
- Avoid raw SQL unless necessary

---

# Code Style Rules

- Use early returns for validation
- Avoid nested conditionals
- Keep functions small and readable
- Prefer named functions over anonymous inline logic
- Use descriptive naming (isValid, hasAccess, userExists)

---

# API Design Rules

- Follow RESTful conventions strictly
- Use consistent response format:

Success:
{
  success: true,
  message: string,
  data?: any
}

Error:
{
  success: false,
  message: string
}

- Version APIs (/api/v1/...)
- Use plural nouns for resources (/doctors, /appointments)

---

# Validation Rules

- Use Zod for request validation
- Validate all incoming data at controller level
- Reject invalid requests early using guard clauses

---

# Logging Rules

- Use morgan for request logging
- Log all errors in server console
- Do not log sensitive data (passwords, tokens)

---

# Performance Rules

- Avoid unnecessary database calls
- Use indexing for frequently queried fields
- Avoid over-fetching data in Prisma queries
- Use pagination for list endpoints

---

# Development Philosophy

- Build simple before scalable
- Prefer clarity over clever code
- Optimize for maintainability and readability
- Treat backend as a long-term scalable system