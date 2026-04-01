---
name: premium-ui-ux-design
description: "Guidelines for World-Class UI/UX, Landing Pages, and PWA Prompts"
---

# Premium UI/UX & PWA Design Guidelines

This skill enforces strict aesthetic and functional rules when generating or refactoring React/Tailwind interfaces, landing pages, and PWA (Progressive Web App) specific components.

## 1. Landing Page Architecture
A modern landing page designed to convert users to download an APK or install a PWA must follow a strict hierarchy:

### 1.1 The Hero Section (Above the Fold)
- **High-Contrast Headline:** A punchy, <H1> tagline explaining exactly what the app does.
- **Glassmorphism:** Use `bg-zinc-900/30 backdrop-blur-md` for floating elements to give a modern depth.
- **Call-to-Action (CTA):** Primary button must be massive, highly noticeable, with a subtle pulse or glow effect (`animate-pulse` or custom shadow).
  - *Example:* "Descargar APK" or "Instalar PWA".
- **Visual Proof:** A tilted, floating mockup (phone frame) showing the app in action (`transform hover:-translate-y-2 transition-transform`).

### 1.2 "How it Works" / Features
- Use grid layouts (`grid-cols-1 md:grid-cols-3`).
- Large emoji icons or customized SVGs inside rounded-2xl blocks.
- **Micro-interactions:** Every card must have `hover:scale-105 transition-all duration-300`.

## 2. PWA & Mobile Experience Rules
When the app is running on mobile or as an installed PWA, standard web patterns break.

### 2.1 The "Install PWA" Prompt
- Must not block the UI. Use a floating banner at the bottom of the screen (`fixed bottom-4 left-4 right-4`).
- Must feel native to iOS/Android.

### 2.2 Touch Targets & Padding
- **Rule of Thumb:** Any clickable element must have a minimum height of `44px` (`h-11`).
- Padding inside buttons must be generous (`px-6 py-3`).
- **No tight gaps:** Minimum `gap-3` or `gap-4` between flex items.

## 3. Aesthetic Polish (Tailwind)
Never use raw colors like `bg-red-500`. 
- **Gradients:** Use soft gradients for primary buttons (`bg-gradient-to-r from-emerald-400 to-emerald-600`).
- **Borders:** Modern cards use super faint borders (`border border-zinc-200 dark:border-zinc-800`).
- **Shadows:** Avoid thick dark shadows. Use soft spread (`shadow-xl shadow-zinc-200/50 dark:shadow-none`).
- **Dark Mode:** Is mandatory. Backgrounds should be `dark:bg-zinc-950` with cards `dark:bg-zinc-900`.

## 4. Interaction & Feedback
- **Active States:** Buttons must have an active scale down (`active:scale-95`).
- **Loading States:** No frozen screens. Every interaction must show a spinner or a skeleton (`animate-pulse`).
- **Transitions:** Every color hover or transform must transition (`transition-all duration-200`).
