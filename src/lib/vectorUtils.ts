/**
 * Calcula la similitud del coseno entre dos vectores.
 * @param a Primer vector.
 * @param b Segundo vector.
 * @returns Valor entre -1 y 1, donde 1 es idéntico.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Los vectores deben tener la misma longitud');
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
