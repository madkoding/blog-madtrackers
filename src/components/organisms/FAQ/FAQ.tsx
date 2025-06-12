"use client";

import React, { useState } from "react";
import { Button, Input } from "../../atoms";
import { Card } from "../../molecules";
import { cn } from "../../../utils/cn";
import { logger } from "../../../lib/logger";

// Simulamos la librería Typewriter (se puede instalar si es necesaria)
const TypewriterEffect = ({ text }: { text: string }) => (
  <div className="text-xl whitespace-pre-wrap animate-pulse">
    {text}
  </div>
);

export interface FAQProps {
  placeholder?: string;
  submitButtonText?: string;
  className?: string;
  onQuestionSubmit?: (question: string, answer: string) => void;
}

export const FAQ = React.memo<FAQProps>(({
  placeholder = "Escribe tu pregunta...",
  submitButtonText = "Preguntar",
  className,
  onQuestionSubmit
}) => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Envía la consulta a la API y actualiza la respuesta.
   */
  const askQuestion = async () => {
    if (!query.trim()) {return;}
    
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      const answerText = data.answer ?? "No se encontró una respuesta.";
      setAnswer(answerText);
      
      // Callback opcional para analytics o logging
      if (onQuestionSubmit) {
        onQuestionSubmit(query, answerText);
      }
    } catch (error) {
      logger.error("Error fetching FAQ answer:", error);
      setAnswer("Error al procesar la pregunta. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el evento de tecla para disparar la consulta al presionar Enter.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      askQuestion();
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto p-6", className)}>
      <div className="space-y-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-lg"
          disabled={loading}
        />

        <Button
          onClick={askQuestion}
          className="w-full text-lg"
          disabled={loading || !query.trim()}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Procesando...</span>
            </div>
          ) : (
            submitButtonText
          )}
        </Button>

        {answer && (
          <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg border-2 border-green-500 font-mono">
            <div className="relative">
              {/* Efecto CRT */}
              <div className="absolute inset-0 bg-green-400 opacity-5 animate-pulse" />
              <TypewriterEffect text={answer} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

FAQ.displayName = "FAQ";

export default FAQ;
