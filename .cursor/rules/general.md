---
description: "General rules focused on high-quality TypeScript code and clean architecture."
globs: "**/*"
alwaysApply: true
---

# Core Principles

- Prioritize clean, readable, production-quality code
- Prefer simplicity over complexity
- Write modular and reusable code
- Avoid duplication (DRY)
- Keep functions small and focused

---

# TypeScript Rules

- Always use strict TypeScript
- Never use `any`
- Prefer `interface` over `type` for objects
- Avoid `enum` (use unions or const objects)
- Always define function return types

---

# Null Safety Rules

- NEVER return `null`
- Use `undefined` or throw errors instead

✔ Good:
```ts
function getUser(id: string): User | undefined
```

✔ Better:
```ts
function getUser(id: string): User {
  if (!user) throw new Error("Not found")
  return user
}
```

---

# Error Handling

- Fail explicitly, never silently
- Use clear error messages
- Handle errors at boundaries only

---

# Function Rules

- One function = one responsibility
- Use early returns
- Avoid deep nesting
- Keep logic outside UI/rendering

---

# Architecture Rules

- Separate logic into layers:
  - UI
  - Service (business logic)
  - Data (DB/API)
- Controllers must stay thin
- Services must not depend on HTTP

---

# API Rules

- Always return consistent shapes
- Never return `null`

Success:
```ts
{ success: true, data }
```

Error:
```ts
{ success: false, message }
```

---

# Code Style

- Prefer functional programming
- Avoid classes unless required
- Avoid mutation when possible
- Use descriptive variable names

---

# Philosophy

- Write code like it will scale to production
- Optimize for readability and maintainability
- Make logic explicit and predictable