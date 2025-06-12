"use client";
import { useState } from "react";
import { Typewriter } from "react-simple-typewriter";

/**
 * Componente FAQ que permite al usuario hacer preguntas y recibir respuestas.
 */
const Faq = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Envía la consulta a la API y actualiza la respuesta.
   */
  const askQuestion = async () => {
    if (!query) {return;}
    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setAnswer(data.answer ?? "No se encontró una respuesta.");
    setLoading(false);
  };

  /**
   * Maneja el evento de tecla para disparar la consulta al presionar Enter.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - El evento del teclado.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      askQuestion();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6 bg-gray-100 rounded-lg shadow-lg text-black">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-3 border rounded mb-4 text-lg"
        placeholder="Escribe tu pregunta..."
      />
      <button
        onClick={askQuestion}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:bg-blue-300 text-lg flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        ) : (
          "Preguntar"
        )}
      </button>

      {answer && (
        <div className="relative mt-6 crt-screen" data-glitch={answer}>
          <div className="white-noise"></div>
          <div className="text-content text-xl whitespace-pre-wrap">
            <Typewriter
              words={[answer]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={25}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Faq;
