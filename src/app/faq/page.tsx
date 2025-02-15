import Faq from "../_components/faq";

/**
 * Página principal que integra el componente FAQ.
 */
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">
        Bienvenido a nuestro FAQ inteligente
      </h1>
      <Faq />
    </main>
  );
}
