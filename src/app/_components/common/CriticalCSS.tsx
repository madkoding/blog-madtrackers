/**
 * CSS crítico inline para optimizar First Paint
 * Solo incluye estilos esenciales para el fold inicial
 */
export const criticalCSS = `
  /* Critical styles for above-the-fold content */
  html { scroll-behavior: smooth; }
  
  body {
    font-family: var(--font-exo2), "Exo 2", sans-serif;
    color: #FFFFFF;
    background: #2D004E;
    background-image: linear-gradient(to right top, #051937, #002667, #0f2e97, #492ec4, #8612eb);
    line-height: 1.5;
    letter-spacing: normal;
    margin: 0;
    padding: 0;
  }
  
  /* Critical layout styles */
  .min-h-screen { min-height: 100vh; }
  .gradient { background-image: linear-gradient(to right top, #051937, #002667, #0f2e97, #492ec4, #8612eb); }
  
  /* Hide non-critical content initially */
  .defer-load { opacity: 0; transition: opacity 0.3s ease; }
  .defer-load.loaded { opacity: 1; }
  
  /* Critical navigation styles */
  nav { position: relative; z-index: 50; }
  
  /* Loading state */
  .loading-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

/**
 * Component que inyecta CSS crítico inline
 */
export default function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: criticalCSS }}
      data-critical="true"
    />
  );
}
