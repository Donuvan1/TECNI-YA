/**
 * SCRIPT PARA SUBIR LOS DATOS DE materiales.json A FIRESTORE
 * 
 * Este script lee el archivo materiales.json y sube toda la estructura
 * a Firestore en la colección "materiales" con la siguiente estructura:
 * 
 * materiales/
 *   ├── sistema/
 *   │   ├── perfiles/estandar/...
 *   │   ├── perfiles/pesados/...
 *   │   ├── accesorios/estandar/...
 *   │   ├── accesorios/pesados/...
 *   │   ├── tiras/estandar/...
 *   │   ├── tiras/pesados/...
 *   │   └── vidrios/...
 *   ├── serie80/ (misma estructura)
 *   └── serie60/ (misma estructura)
 * 
 * También crea:
 *   - colección "obras" para guardar cotizaciones
 *   - colección "proyectos" para guardar proyectos
 * 
 * EJECUTAR: node scripts/subir-datos-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Inicializar Firebase Admin con la service account
// NOTA: Debes descargar tu service account key desde Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
// Y guardarla como serviceAccountKey.json en la raíz del proyecto
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function subirDatos() {
  console.log('🚀 Iniciando carga de datos a Firestore...\n');

  try {
    // Leer materiales.json
    const materialesPath = path.join(__dirname, '..', 'proyectos-tecnicos', 'materiales.json');
    const materialesRaw = fs.readFileSync(materialesPath, 'utf8');
    const materiales = JSON.parse(materialesRaw);

    const sistemas = ['sistema', 'serie80', 'serie60'];
    
    for (const sistema of sistemas) {
      console.log(`📦 Procesando: ${materiales[sistema].nombre} (${sistema})`);
      
      const data = materiales[sistema];
      
      // 1. SUBIR PERFILES
      console.log(`   📐 Subiendo perfiles...`);
      for (const categoria of ['estandar', 'pesados']) {
        const perfiles = data.perfiles[categoria];
        for (let i = 0; i < perfiles.length; i++) {
          const perfil = perfiles[i];
          const docRef = db.collection('materiales')
            .doc(sistema)
            .collection('perfiles')
            .doc(categoria)
            .collection('items')
            .doc(`item_${i}`);
          
          await docRef.set({
            nombre: perfil.n,
            codigo: perfil.c,
            precio: perfil.p,
            orden: i,
            categoria: categoria,
            sistema: sistema,
            tipo: 'perfil',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      // 2. SUBIR ACCESORIOS
      console.log(`   🔧 Subiendo accesorios...`);
      for (const categoria of ['estandar', 'pesados']) {
        const accesorios = data.accesorios[categoria];
        for (let i = 0; i < accesorios.length; i++) {
          const acc = accesorios[i];
          const docRef = db.collection('materiales')
            .doc(sistema)
            .collection('accesorios')
            .doc(categoria)
            .collection('items')
            .doc(`item_${i}`);
          
          await docRef.set({
            nombre: acc.n,
            codigo: acc.c,
            precio: acc.p,
            orden: i,
            categoria: categoria,
            sistema: sistema,
            tipo: 'accesorio',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      // 3. SUBIR TIRAS
      console.log(`   📏 Subiendo tiras...`);
      for (const categoria of ['estandar', 'pesados']) {
        const tiras = data.tiras[categoria];
        for (let i = 0; i < tiras.length; i++) {
          const tira = tiras[i];
          const docRef = db.collection('materiales')
            .doc(sistema)
            .collection('tiras')
            .doc(categoria)
            .collection('items')
            .doc(`item_${i}`);
          
          await docRef.set({
            nombre: tira.n,
            codigo: tira.c,
            precio: tira.p,
            orden: i,
            categoria: categoria,
            sistema: sistema,
            tipo: 'tira',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      // 4. SUBIR VIDRIOS
      console.log(`   🪟 Subiendo vidrios...`);
      const vidrios = data.vidrios;
      for (let i = 0; i < vidrios.length; i++) {
        const vidrio = vidrios[i];
        const docRef = db.collection('materiales')
          .doc(sistema)
          .collection('vidrios')
          .doc(`item_${i}`);
        
        await docRef.set({
          nombre: vidrio.n,
          precio: vidrio.p,
          orden: i,
          sistema: sistema,
          tipo: 'vidrio',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      console.log(`   ✅ ${materiales[sistema].nombre} completado.\n`);
    }

    // 5. GUARDAR TAMBIÉN EL JSON COMPLETO COMO REFERENCIA
    console.log('📄 Guardando snapshot completo...');
    await db.collection('metadata').doc('materiales_snapshot').set({
      data: materiales,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });

    console.log('\n✨ ¡CARGA COMPLETADA EXITOSAMENTE!');
    console.log('   Los datos están disponibles en Firestore.');
    console.log('   Colección: materiales/{sistema}/{tipo}/{categoria}/items/{item}');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la carga:', error);
    process.exit(1);
  }
}

subirDatos();
