import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: '.env.local' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Firebase...');
    console.log('📋 Configuración:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? '[CONFIGURADO]' : '[FALTANTE]'
    });

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado correctamente');
    
    // Probar conexión con user_tracking
    console.log('📊 Probando acceso a colección user_tracking...');
    const trackingsRef = collection(db, 'user_tracking');
    const q = query(trackingsRef, limit(5));
    
    const snapshot = await getDocs(q);
    console.log(`📈 Encontrados ${snapshot.size} documentos en user_tracking`);
    
    if (snapshot.size > 0) {
      console.log('📋 Primeros documentos:');
      let index = 0;
      snapshot.forEach((doc) => {
        index++;
        const data = doc.data();
        console.log(`  ${index}. ID: ${doc.id}`);
        console.log(`     Usuario: ${data.nombreUsuario || 'N/A'}`);
        console.log(`     País: ${data.paisEnvio || 'N/A'}`);
        console.log(`     Estado: ${data.estadoPedido || 'N/A'}`);
        console.log(`     Creado: ${data.createdAt || 'N/A'}`);
        console.log('     ---');
      });
    }
    
    console.log('✅ Conexión a Firebase exitosa');
    
  } catch (error) {
    console.error('❌ Error conectando a Firebase:', error);
    console.error('   Detalles:', error instanceof Error ? error.message : String(error));
  }
}

testConnection();
