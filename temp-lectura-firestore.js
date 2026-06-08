/**
 * Script temporal para LEER datos de Firestore y guardarlos como JSON
 * Ejecutar: node temp-lectura-firestore.js
 * Luego borrar este archivo
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Buscar archivo de credenciales
const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ No se encuentra service-account-key.json');
    console.log('Para obtenerlo:');
    console.log('1. Ve a https://console.firebase.google.com/project/proyecto-libertad-38c2a/settings/serviceaccounts/adminsdk');
    console.log('2. Haz clic en "Generar nueva clave privada"');
    console.log('3. Guarda el archivo como "service-account-key.json" en la carpeta del proyecto');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function leerDatos() {
    try {
        const docRef = db.collection('baseDatosV2').doc('compartido');
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            console.log('❌ No se encontraron datos en baseDatosV2/compartido');
            return;
        }
        
        const data = docSnap.data();
        const items = data.items;
        
        if (!items || Object.keys(items).length === 0) {
            console.log('❌ No hay items en el documento');
            return;
        }
        
        console.log('✅ Datos encontrados!');
        console.log(`Categorías/colores: ${Object.keys(items).length}`);
        
        // Contar items por categoría
        const categorias = {};
        Object.entries(items).forEach(([key, arr]) => {
            if (Array.isArray(arr)) {
                const cat = key.split('_')[0];
                if (!categorias[cat]) categorias[cat] = 0;
                categorias[cat] += arr.length;
            }
        });
        
        console.log('\n📊 Resumen por categoría:');
        Object.entries(categorias).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count} items`);
        });
        
        // Guardar como JSON
        const jsonPath = path.join(__dirname, 'datos-firestore-completos.json');
        fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf8');
        console.log(`\n✅ Datos guardados en: ${jsonPath}`);
        
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

leerDatos();
