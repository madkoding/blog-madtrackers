"use client";
import { useState } from "react";
import { Typewriter } from "react-simple-typewriter";

/**
 * Componente FAQ que permite al usuario hacer preguntas y recibir respuestas.
 */
const Faq = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [faqId, setFaqId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Envía la consulta a la API y actualiza la respuesta.
   */
  const askQuestion = async () => {
    if (!query) return;
    setLoading(true);
    setAnswer("");
    setFaqId(null);

    const res = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setAnswer(data.answer || "No se encontró una respuesta.");
    setFaqId(data.faqId || null);
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6 bg-gray-100 rounded-lg shadow-lg text-black">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
          {faqId && <FeedbackButtons faqId={faqId} />}
        </div>
      )}
    </div>
  );
};

export default Faq;

/**
 * Componente para registrar el feedback del usuario.
 * @param param0 Objeto con la propiedad faqId.
 */
function FeedbackButtons({ faqId }: { faqId: number }) {
  const [feedbackSent, setFeedbackSent] = useState(false);

  /**
   * Envía el feedback a la API.
   * @param helpful Boolean indicando si la respuesta fue útil.
   */
  const sendFeedback = async (helpful: boolean) => {
    await fetch("/api/faq/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faqId, helpful }),
    });
    setFeedbackSent(true);
  };

  return feedbackSent ? (
    <p className="mt-2 text-green-600 font-semibold">
      ¡Gracias por tu feedback! 😊
    </p>
  ) : (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => sendFeedback(true)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        👍 Sí
      </button>
      <button
        onClick={() => sendFeedback(false)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        👎 No
      </button>
    </div>
  );
}
