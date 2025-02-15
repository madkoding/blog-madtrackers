/**
 * @fileoverview Script para precomputar embeddings de las FAQ y guardarlas en un archivo JSON.
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

/** Configuración de OpenAI */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Rutas de los archivos */
const inputPath = path.join(__dirname, '../data/faqs.json');
const outputPath = path.join(__dirname, '../data/faqs_with_embeddings.json');

/** Interfaz para las FAQ originales */
interface FAQ {
  question: string;
  answer: string;
}

/** Interfaz para las FAQ con embedding */
interface FAQWithEmbedding extends FAQ {
  embedding: number[];
}

async function main() {
  // Leer las FAQs del archivo JSON
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const faqs: FAQ[] = JSON.parse(rawData);

  const faqsWithEmbeddings: FAQWithEmbedding[] = [];

  // Para cada FAQ, genera el embedding de la pregunta
  for (const faq of faqs) {
    console.log(`Procesando: ${faq.question}`);
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: faq.question,
    });
    // Se asume que response.data es un array con al menos un elemento
    const embedding = response.data[0].embedding;

    faqsWithEmbeddings.push({ ...faq, embedding });
  }

  // Escribir el resultado en un nuevo archivo JSON
  fs.writeFileSync(outputPath, JSON.stringify(faqsWithEmbeddings, null, 2), 'utf-8');
  console.log('Embeddings precomputados guardados en:', outputPath);
}

main().catch(console.error);
