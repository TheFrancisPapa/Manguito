// src/components/layout/AppShell.jsx
export function AppShell({ children }) {
  return (
    <>
      {/* Skip-link: permite a usuarios de teclado saltar nav */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
    </>
  )
}
