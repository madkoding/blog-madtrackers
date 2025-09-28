import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('❌ Falta la configuración de Firebase. Asegúrate de tener .env.local con las claves necesarias.');
  process.exit(1);
}

const [,, transactionId] = process.argv;

if (!transactionId) {
  console.error('Uso: ts-node scripts/findTrackingByTransaction.ts <transactionId>');
  process.exit(1);
}

async function findTracking() {
  console.log(`🔍 Buscando tracking para el identificador "${transactionId}"...`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const trackingsRef = collection(db, 'user_tracking');

  const queries = [
    { label: 'paymentTransactionId', value: query(trackingsRef, where('paymentTransactionId', '==', transactionId), limit(5)) },
    { label: 'paypalTransactionId', value: query(trackingsRef, where('paypalTransactionId', '==', transactionId), limit(5)) },
    { label: 'nombreUsuario', value: query(trackingsRef, where('nombreUsuario', '==', transactionId), limit(5)) }
  ];

  let found = false;

  for (const { label, value } of queries) {
    console.log(`\n📁 Consultando por ${label}...`);
    try {
      const snapshot = await getDocs(value);
      if (snapshot.empty) {
        console.log('  ➜ Sin resultados');
        continue;
      }

      found = true;
      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const userData = (data.userData ?? {}) as Record<string, unknown>;

        console.log('  ➜ Documento encontrado:');
        console.log(`     ID: ${doc.id}`);
        console.log(`     nombreUsuario: ${data.nombreUsuario ?? 'N/A'}`);
        console.log(`     paymentTransactionId: ${data.paymentTransactionId ?? 'N/A'}`);
        console.log(`     paypalTransactionId: ${data.paypalTransactionId ?? 'N/A'}`);
        console.log(`     estadoPedido: ${data.estadoPedido ?? 'N/A'}`);
        console.log(`     vrchatUsername: ${data.vrchatUsername ?? userData.nombreUsuarioVrChat ?? 'N/A'}`);
        console.log(`     createdAt: ${data.createdAt ?? 'N/A'}`);
        console.log('     ---');
      });
    } catch (error) {
      console.error('  ❌ Error ejecutando la consulta:', error instanceof Error ? error.message : error);
    }
  }

  if (!found) {
    console.log('\nℹ️ No se encontraron documentos que coincidan con el identificador proporcionado.');
  }
}

findTracking().catch((error) => {
  console.error('❌ Error general al buscar el tracking:', error instanceof Error ? error.message : error);
  process.exit(1);
});
