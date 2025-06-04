import * as THREE from 'three';

// Cache global para modelos FBX optimizados
class ModelCache {
  private static instance: ModelCache;
  private readonly cache = new Map<string, THREE.Group>();
  private readonly loadingPromises = new Map<string, Promise<THREE.Group>>();

  static getInstance(): ModelCache {
    if (!ModelCache.instance) {
      ModelCache.instance = new ModelCache();
    }
    return ModelCache.instance;
  }

  has(modelPath: string): boolean {
    return this.cache.has(modelPath);
  }

  get(modelPath: string): THREE.Group | undefined {
    const cached = this.cache.get(modelPath);
    return cached ? cached.clone() : undefined;
  }

  set(modelPath: string, model: THREE.Group): void {
    // Crear una copia limpia del modelo para cacheo
    const cleanModel = model.clone();
    this.optimizeModelForCaching(cleanModel);
    this.cache.set(modelPath, cleanModel);
  }

  getLoadingPromise(modelPath: string): Promise<THREE.Group> | undefined {
    return this.loadingPromises.get(modelPath);
  }

  setLoadingPromise(modelPath: string, promise: Promise<THREE.Group>): void {
    this.loadingPromises.set(modelPath, promise);
  }

  private optimizeModelForCaching(model: THREE.Group): void {
    // Optimizar geometrías para el cache
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        // Merge geometrías similares si es posible
        if (!child.geometry.attributes.position.normalized) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
        
        // Optimizar buffers
        if (child.geometry.index) {
          child.geometry.setIndex(child.geometry.index);
        }
      }
    });
  }

  clear(): void {
    // Limpiar recursos de GPU
    this.cache.forEach((model) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    });
    
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Método para obtener estadísticas del cache
  getStats(): { size: number; models: string[] } {
    return {
      size: this.cache.size,
      models: Array.from(this.cache.keys())
    };
  }
}

export default ModelCache;
