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

const COLLECTION_NAME = 'user_tracking';

export class FirebaseTrackingService {
  
  /**
   * Crear un nuevo registro de tracking
   */
  static async createTracking(trackingData: UserTracking): Promise<string> {
    try {
      console.log('🔥 [FIREBASE SERVICE] Starting tracking creation...');
      console.log('🔥 [FIREBASE SERVICE] Collection name:', COLLECTION_NAME);
      console.log('🔥 [FIREBASE SERVICE] Input tracking data keys:', Object.keys(trackingData));
      
      // Generar hash si no existe
      const userHash = trackingData.userHash ?? generateUserHash(trackingData.nombreUsuario);
      console.log('🔥 [FIREBASE SERVICE] Generated userHash:', userHash);
      
      const finalData = {
        ...trackingData,
        userHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔥 [FIREBASE SERVICE] Final data to save:', JSON.stringify(finalData, null, 2));
      console.log('🔥 [FIREBASE SERVICE] About to call addDoc...');
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), finalData);
      
      console.log('🔥 [FIREBASE SERVICE] addDoc completed successfully');
      console.log('🔥 [FIREBASE SERVICE] Document ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ [FIREBASE SERVICE] Error creating tracking:', error);
      console.error('❌ [FIREBASE SERVICE] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
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
      console.error('Error getting tracking:', error);
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
      console.error('Error getting tracking by username:', error);
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
      console.error('Error getting tracking by user hash:', error);
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
        
        // IMPORTANTE: NO regenerar hash automáticamente durante consultas de solo lectura
        // Solo mostrar warning si falta el hash, pero no modificar los datos
        if (tracking && !tracking.userHash) {
          console.warn(`⚠️ Usuario "${tracking.nombreUsuario}" no tiene userHash. Se debería regenerar manualmente.`);
        }
      }
      
      return tracking;
    } catch (error) {
      console.error('Error getting tracking by hash or username:', error);
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
      console.error('Error getting all trackings:', error);
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
      console.error('Error updating tracking:', error);
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
      console.error('Error deleting tracking:', error);
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
      console.error('Error getting trackings by shipping status:', error);
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
      console.error('Error getting trackings near deadline:', error);
      throw error;
    }
  }

  /**
   * Buscar tracking por ID de transacción de pago para evitar duplicados
   */
  static async getTrackingByPaymentTransactionId(transactionId: string): Promise<UserTracking | null> {
    try {
      console.log('🔍 [FIREBASE SERVICE] Searching for existing tracking with transactionId:', transactionId);
      
      const q = query(
        collection(db, COLLECTION_NAME),
        where('paymentTransactionId', '==', transactionId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('✅ [FIREBASE SERVICE] No existing tracking found for transactionId:', transactionId);
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const tracking = {
        id: doc.id,
        ...doc.data()
      } as UserTracking;
      
      console.log('⚠️ [FIREBASE SERVICE] Found existing tracking for transactionId:', transactionId, 'userHash:', tracking.userHash);
      return tracking;
      
    } catch (error) {
      console.error('❌ [FIREBASE SERVICE] Error searching for tracking by transactionId:', error);
      throw error;
    }
  }
}
