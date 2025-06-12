import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserTracking } from '../interfaces/tracking';
import { generateUserHash } from '../utils/hashUtils';
import { logger } from './logger';

const COLLECTION_NAME = 'user_tracking';

export class FirebaseTrackingService {
  
  /**
   * Crear un nuevo registro de tracking
   */
  static async createTracking(trackingData: UserTracking): Promise<string> {
    try {
      // Generar hash si no existe
      const userHash = trackingData.userHash ?? generateUserHash(trackingData.nombreUsuario);
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...trackingData,
        userHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      logger.error('Error creating tracking:', error);
      throw error;
    }
  }

  /**
   * Obtener un registro de tracking por ID
   */
  static async getTrackingById(id: string): Promise<UserTracking | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserTracking;
      } else {
        return null;
      }
    } catch (error) {
      logger.error('Error getting tracking:', error);
      throw error;
    }
  }

  /**
   * Obtener un registro de tracking por nombre de usuario
   */
  static async getTrackingByUsername(nombreUsuario: string): Promise<UserTracking | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('nombreUsuario', '==', nombreUsuario),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserTracking;
      } else {
        return null;
      }
    } catch (error) {
      logger.error('Error getting tracking by username:', error);
      throw error;
    }
  }

  /**
   * Obtener un registro de tracking por hash de usuario (método seguro)
   */
  static async getTrackingByUserHash(userHash: string): Promise<UserTracking | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userHash', '==', userHash),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserTracking;
      } else {
        return null;
      }
    } catch (error) {
      logger.error('Error getting tracking by user hash:', error);
      throw error;
    }
  }

  /**
   * Buscar tracking por hash o username (para compatibilidad hacia atrás)
   */
  static async getTrackingByHashOrUsername(identifier: string): Promise<UserTracking | null> {
    try {
      // Primero intentar buscar por hash (método preferido)
      let tracking = await this.getTrackingByUserHash(identifier);
      
      // Si no se encuentra por hash, intentar por username para compatibilidad
      if (!tracking) {
        tracking = await this.getTrackingByUsername(identifier);
        
        // Si se encuentra por username pero no tiene hash, generar y actualizar
        if (tracking?.id && !tracking.userHash) {
          const userHash = generateUserHash(tracking.nombreUsuario);
          await this.updateTracking(tracking.id, { userHash });
          tracking.userHash = userHash;
        }
      }
      
      return tracking;
    } catch (error) {
      logger.error('Error getting tracking by hash or username:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los registros de tracking
   */
  static async getAllTrackings(): Promise<UserTracking[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserTracking[];
    } catch (error) {
      logger.error('Error getting all trackings:', error);
      throw error;
    }
  }

  /**
   * Actualizar un registro de tracking
   */
  static async updateTracking(id: string, trackingData: Partial<UserTracking>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...trackingData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error updating tracking:', error);
      throw error;
    }
  }

  /**
   * Eliminar un registro de tracking
   */
  static async deleteTracking(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      logger.error('Error deleting tracking:', error);
      throw error;
    }
  }

  /**
   * Buscar trackings por estado de envío
   */
  static async getTrackingsByShippingStatus(envioPagado: boolean): Promise<UserTracking[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('envioPagado', '==', envioPagado),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserTracking[];
    } catch (error) {
      logger.error('Error getting trackings by shipping status:', error);
      throw error;
    }
  }

  /**
   * Buscar trackings por fecha límite próxima
   */
  static async getTrackingsNearDeadline(days: number = 7): Promise<UserTracking[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('fechaLimite', '<=', futureDate.toISOString()),
        orderBy('fechaLimite', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserTracking[];
    } catch (error) {
      logger.error('Error getting trackings near deadline:', error);
      throw error;
    }
  }
}
