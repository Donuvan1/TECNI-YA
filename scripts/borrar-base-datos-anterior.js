/**
 * SCRIPT PARA BORRAR LA BASE DE DATOS ANTERIOR (colección "materiales") DE FIRESTORE
 * 
 * Este script elimina TODOS los documentos de la colección "materiales" y sus subcolecciones.
 * También elimina el snapshot de metadata.
 * 
 * EJECUTAR: node scripts/borrar-base-datos-anterior.js
 * 
 * REQUISITOS:
 *   1. Tener serviceAccountKey.json en la raíz del proyecto
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin con la service account
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Elimina todos los documentos de una colección, incluyendo subcolecciones
 */
async function borrarColeccion(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  let totalBorrados = 0;
  
  for (const doc of snapshot.docs) {
    // Primero borrar subcolecciones recursivamente
    const subCollections = await doc.ref.listCollections();
    for (const subCol of subCollections) {
      const subColPath = `${collectionPath}/${doc.id}/${subCol.id}`;
      const subCount = await borrarColeccion(subColPath);
      totalBorrados += subCount;
    }
    
    // Luego borrar el documento
    await doc.ref.delete();
    totalBorrados++;
    console.log(`   🗑️ Eliminado: ${collectionPath}/${doc.id}`);
  }
  
  return totalBorrados;
}

async function borrarBaseDatosAnterior() {
  console.log('🚀 Iniciando borrado de la Base de Datos anterior...\n');
  
  try {
    // 1. Borrar colección "materiales" (la base de datos anterior)
    console.log('📦 Eliminando colección "materiales"...');
    const totalMateriales = await borrarColeccion('materiales');
    console.log(`   ✅ ${totalMateriales} documentos eliminados de "materiales"\n`);
    
    // 2. Borrar el snapshot de metadata
    console.log('📄 Eliminando metadata...');
    const metadataRef = db.collection('metadata').doc('materiales_snapshot');
    const metadataDoc = await metadataRef.get();
    if (metadataDoc.exists) {
      await metadataRef.delete();
      console.log('   ✅ metadata/materiales_snapshot eliminado\n');
    } else {
      console.log('   ⏭️ metadata/materiales_snapshot no existe\n');
    }
    
    console.log('✨ ¡BASE DE DATOS ANTERIOR ELIMINADA EXITOSAMENTE!');
    console.log('   Colección "materiales" eliminada.');
    console.log('   La Base de Datos 2.0 (colección "baseDatosV2") no fue afectada.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el borrado:', error);
    process.exit(1);
  }
}

borrarBaseDatosAnterior();
