---
name: vercel-react-best-practices
description: React and Next.js Best Practices from Vercel Engineering
---

# React Best Practices

**Version 1.0.0**  
Vercel Engineering  

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring React and Next.js codebases. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

## Abstract
Comprehensive performance optimization guide for React and Next.js applications, designed for AI agents and LLMs. Contains rules across categories, prioritized by impact from critical (eliminating waterfalls, reducing bundle size) to incremental (advanced patterns). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide automated refactoring and code generation.

## 1. Eliminating Waterfalls
**Impact: CRITICAL**
Waterfalls are the #1 performance killer. Each sequential await adds full network latency. Eliminating them yields the largest gains.

### 1.1 Check Cheap Conditions Before Async Flags
**Impact: HIGH (avoids unnecessary async work when a synchronous guard already fails)**
When a branch uses `await` for a flag or remote value and also requires a **cheap synchronous** condition (local props, request metadata, already-loaded state), evaluate the cheap condition **first**.

**Incorrect:**
```typescript
const someFlag = await getFlag()
if (someFlag && someCondition) { /* ... */ }
```

**Correct:**
```typescript
if (someCondition) {
  const someFlag = await getFlag()
  if (someFlag) { /* ... */ }
}
```

### 1.2 Promise.all() for Independent Operations
**Impact: CRITICAL (2-10× improvement)**
When async operations have no interdependencies, execute them concurrently using `Promise.all()`.

**Incorrect: sequential execution, 3 round trips**
```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Correct: parallel execution, 1 round trip**
```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

## 2. Bundle Size Optimization
**Impact: CRITICAL**
Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint.

### 2.1 Avoid Barrel File Imports
**Impact: CRITICAL (200-800ms import cost, slow builds)**
Import directly from source files instead of barrel files to avoid loading thousands of unused modules.

**Incorrect: imports entire library**
```tsx
import { Check, X, Menu } from 'lucide-react'
```

**Correct - Direct imports (non-Next.js projects):**
```tsx
import Button from '@mui/material/Button'
```

### 2.4 Dynamic Imports for Heavy Components
**Impact: CRITICAL (directly affects TTI and LCP)**
Use `React.lazy` or `next/dynamic` to lazy-load large components not needed on initial render.

## 3. Client-Side Data Fetching
**Impact: MEDIUM-HIGH**

### 3.1 Use Passive Event Listeners for Scrolling Performance
**Impact: MEDIUM (eliminates scroll delay caused by event listeners)**
Add `{ passive: true }` to touch and wheel event listeners to enable immediate scrolling.

**Correct:**
```typescript
document.addEventListener('touchstart', handleTouch, { passive: true })
document.addEventListener('wheel', handleWheel, { passive: true })
```

### 3.2 Use SWR / React Query for Automatic Deduplication
**Impact: MEDIUM-HIGH (automatic deduplication)**
These libraries enable request deduplication, caching, and revalidation across component instances.

---
// Las secciones de rendimiento avanzado, SSR puro y manejo de renderizaciones han sido internalizadas para su uso en futuras reescrituras de la app Manguito.
