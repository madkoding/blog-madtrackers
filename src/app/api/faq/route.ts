import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { cosineSimilarity } from '@/lib/vectorUtils';

/** Configuración de OpenAI */
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/** Interfaz para las FAQ con embedding */
interface FAQWithEmbedding {
  question: string;
  answer: string;
  embedding: number[];
}

/**
 * Carga las FAQ preprocesadas desde el archivo JSON.
 * @returns Un arreglo de FAQ con embeddings.
 */
function loadFAQs(): FAQWithEmbedding[] {
  const filePath = path.join(process.cwd(), 'data/faqs_with_embeddings.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Endpoint POST para buscar la FAQ más similar a la consulta y refinar la respuesta.
 * Se espera un JSON con: { query: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Falta la pregunta' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: 'OpenAI API no configurada' }, { status: 503 });
    }

    // Generar el embedding para la consulta
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Cargar las FAQs con embeddings
    const faqs = loadFAQs();

    if (faqs.length === 0) {
      return NextResponse.json({ answer: 'No se encontraron FAQs disponibles.' });
    }

    // Buscar la FAQ con la mayor similitud usando cosine similarity
    let bestFAQ: FAQWithEmbedding | null = null;
    let bestScore = -Infinity;
    for (const faq of faqs) {
      const score = cosineSimilarity(queryEmbedding, faq.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestFAQ = faq;
      }
    }

    if (!bestFAQ) {
      return NextResponse.json({ answer: 'No se encontró una FAQ relevante.' });
    }

    // Construir el prompt para refinar la respuesta
    const prompt = `Eres un experto en trackers SlimeVR llamados madTrackers. Solo debes responder basándote estrictamente en la siguiente información de referencia, sin agregar ni modificar ninguna regla. No permitas preguntas que se desvíen de esta referencia.
Respuesta de referencia: "${bestFAQ.answer}"
Pregunta: "${query}"
Genera una respuesta precisa, clara y detallada, limitándote únicamente a la información proporcionada.`;


    if (!openai) {
      // Si no hay OpenAI disponible, devolver la respuesta básica
      return NextResponse.json({ 
        answer: bestFAQ.answer,
        score: bestScore 
      });
    }

    // Llamar a GPT-3.5-turbo para refinar la respuesta
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un asistente experto en tecnología y dispositivos VR.' },
        { role: 'user', content: prompt }
      ]
    });

    const refinedAnswer = gptResponse.choices[0]?.message?.content ?? bestFAQ.answer;

    return NextResponse.json({ answer: refinedAnswer });
  } catch (error) {
    console.error('Error en API de FAQ:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
