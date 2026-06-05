/**
 * SCRIPT PARA POBLAR LA BASE DE DATOS 2.0 CON DATOS INICIALES
 * 
 * Este script genera datos iniciales para la Base de Datos 2.0
 * basados en los materiales existentes en sistema.js y los sube
 * a Firestore en la colección "baseDatosV2".
 * 
 * Los datos se estructuran como:
 *   baseDatosV2/datos -> { items: { categoria_color: [items...] } }
 * 
 * EJECUTAR: node scripts/poblar-base-datos-v2.js
 * 
 * REQUISITOS:
 *   1. Tener serviceAccountKey.json en la raíz del proyecto
 *      (descargar de Firebase Console > Project Settings > Service Accounts)
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin con la service account
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ========== DATOS DE MATERIALES (desde sistema.js) ==========

const perfiles = {
    estandar: [
        {n: "m fija corrediza", c: "3185", p: 3.64},
        {n: "m doble corrediza", c: "3188", p: 4.45},
        {n: "puente standar", c: "5283", p: 8.26},
        {n: "puente doble corr", c: "5284", p: 10.14},
        {n: "riel inferior", c: "8413", p: 1.86},
        {n: "riel doble", c: "8444", p: 3.51},
        {n: "u-12", c: "u-12", p: 2.30},
        {n: "perfil H", c: "8220", p: 5.55},
        {n: "portafelpa", c: "8116", p: 0.81},
        {n: "angulo", c: "4104", p: 0.83},
        {n: "soporte", c: "0000", p: 20.00},
        {n: "U-13", c: "U-13", p: 2.50}, 
        {n: "u bajita", c: "3206", p: 2.00}
    ],
    pesados: [
        {n: "m fija corrediza", c: "3185", p: 3.64},
        {n: "m doble corrediza", c: "3188", p: 4.45},
        {n: "puente pesado", c: "5282", p: 10.54},
        {n: "puente doble corr", c: "5284", p: 10.14},
        {n: "riel inferior", c: "83132", p: 2.77},
        {n: "riel doble", c: "8445", p: 3.61},
        {n: "U baja", c: "3003", p: 2.80},
        {n: "perfil H", c: "8221", p: 6.38},
        {n: "portafelpa", c: "8115", p: 0.85},
        {n: "ángulo", c: "4103", p: 1.02},
        {n: "soporte", c: "0000", p: 20.00},
        {n: "u-alta", c: "7955", p: 3.00}, 
        {n: "u alta pesada", c: "3009", p: 3.50} 
    ]
};

const vidrios = [
    { n: "Incoloro 2 mm", p: 1.50 },
    { n: "Incoloro 4 mm", p: 3.00 },
    { n: "Incoloro 5.5 mm", p: 4.50 },
    { n: "Reflejante 6 mm", p: 8.50 },
    { n: "Catedral 4 mm", p: 5.00 }
];

const accesorios = {
    estandar: [
        {n: "Seguro F C", c: "s-s", p: 2.50},
        {n: "Seguro C C", c: "s-b", p: 1.50},
        {n: "Garruchas", c: "r-15", p: 1.05},
        {n: "Plaquitas", c: "p-q", p: 0.50}
    ],
    pesados: [
        {n: "Seguro F C", c: "s-s", p: 2.50},
        {n: "Seguro C C", c: "s-b", p: 1.50},
        {n: "Garruchas", c: "r-15", p: 1.05},
        {n: "Plaquitas", c: "p-q", p: 0.50}
    ]
};

const tiras = {
    estandar: [
        {n: "Felpa 10", c: "f-10", p: 0.50},
        {n: "Felpa 15", c: "f-15", p: 0.75}
    ],
    pesados: [
        {n: "Felpa 10", c: "f-10", p: 0.50},
        {n: "Felpa 15", c: "f-15", p: 0.75}
    ]
};

// ========== FUNCIÓN PARA CONVERTIR A FORMATO BASE DATOS V2 ==========

function crearItem(nombre, codigo, precio, categoria, color, colorTexto, tipo) {
    const item = {
        nombre: nombre,
        codigo: codigo || '—',
        medida: '—',
        stock: 0,
        compra: 0,
        venta: precio,
        ventaMetro: 0,
        apk: 0,
        vendidos: 0,
        categoria: categoria,
        colorTexto: colorTexto,
        color: color,
        tipo: tipo || 'general'
    };
    return item;
}

function generarDatosIniciales() {
    const datos = {};

    // ===== VARILLAS (Perfiles) =====
    // Colores para varillas: natural, negro, negro-brillante, blanco, madera, duna
    const coloresVarillas = [
        { value: 'natural', label: 'Natural (Gris)' },
        { value: 'negro', label: 'Negro' },
        { value: 'negro-brillante', label: 'Negro Brillante' },
        { value: 'blanco', label: 'Blanco' },
        { value: 'madera', label: 'Madera' },
        { value: 'duna', label: 'Duna' }
    ];

    // Perfiles estándar
    perfiles.estandar.forEach((perfil, index) => {
        coloresVarillas.forEach(color => {
            const key = `varillas_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                perfil.n,
                perfil.c,
                perfil.p,
                'varillas',
                color.value,
                color.label,
                'perfil'
            );
            datos[key].push(item);
        });
    });

    // Perfiles pesados
    perfiles.pesados.forEach((perfil, index) => {
        coloresVarillas.forEach(color => {
            const key = `varillas_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                perfil.n + ' (P)',
                perfil.c,
                perfil.p,
                'varillas',
                color.value,
                color.label,
                'perfil-pesado'
            );
            datos[key].push(item);
        });
    });

    // ===== ACCESORIOS =====
    const coloresAccesorios = [
        { value: 'gris', label: 'Gris' },
        { value: 'negro', label: 'Negro' },
        { value: 'blanco', label: 'Blanco' },
        { value: 'madera', label: 'Madera' }
    ];

    accesorios.estandar.forEach((acc, index) => {
        coloresAccesorios.forEach(color => {
            const key = `accesorios_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                acc.n,
                acc.c,
                acc.p,
                'accesorios',
                color.value,
                color.label,
                'accesorio'
            );
            datos[key].push(item);
        });
    });

    accesorios.pesados.forEach((acc, index) => {
        coloresAccesorios.forEach(color => {
            const key = `accesorios_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                acc.n + ' (P)',
                acc.c,
                acc.p,
                'accesorios',
                color.value,
                color.label,
                'accesorio-pesado'
            );
            datos[key].push(item);
        });
    });

    // ===== TIRAS =====
    const coloresTiras = [
        { value: 'gris', label: 'Gris' },
        { value: 'negro', label: 'Negro' },
        { value: 'blanco', label: 'Blanco' }
    ];

    tiras.estandar.forEach((tira, index) => {
        coloresTiras.forEach(color => {
            const key = `tiras_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                tira.n,
                tira.c,
                tira.p,
                'tiras',
                color.value,
                color.label,
                'tira'
            );
            datos[key].push(item);
        });
    });

    tiras.pesados.forEach((tira, index) => {
        coloresTiras.forEach(color => {
            const key = `tiras_${color.value}`;
            if (!datos[key]) datos[key] = [];
            
            const item = crearItem(
                tira.n + ' (P)',
                tira.c,
                tira.p,
                'tiras',
                color.value,
                color.label,
                'tira-pesada'
            );
            datos[key].push(item);
        });
    });

    // ===== OTROS (Vidrios) =====
    vidrios.forEach((vidrio, index) => {
        const key = 'otros_general';
        if (!datos[key]) datos[key] = [];
        
        const item = crearItem(
            vidrio.n,
            '—',
            vidrio.p,
            'otros',
            'general',
            'General',
            'vidrio'
        );
        datos[key].push(item);
    });

    return datos;
}

// ========== SUBIR A FIRESTORE ==========

async function poblarBaseDatos() {
    console.log('🚀 Iniciando población de Base de Datos 2.0...\n');

    try {
        const datosIniciales = generarDatosIniciales();
        
        // Contar total de items
        let totalItems = 0;
        Object.keys(datosIniciales).forEach(key => {
            totalItems += datosIniciales[key].length;
        });
        
        console.log(`📊 Total de categorías/colores: ${Object.keys(datosIniciales).length}`);
        console.log(`📦 Total de items a subir: ${totalItems}\n`);

        // Mostrar resumen por categoría
        const resumen = {};
        Object.keys(datosIniciales).forEach(key => {
            const [categoria, color] = key.split('_');
            if (!resumen[categoria]) resumen[categoria] = 0;
            resumen[categoria] += datosIniciales[key].length;
        });
        
        Object.keys(resumen).forEach(cat => {
            console.log(`   ${cat}: ${resumen[cat]} items`);
        });
        console.log('');

        // Subir a Firestore
        const docRef = db.collection('baseDatosV2').doc('datos');
        await docRef.set({
            items: datosIniciales,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            version: '1.0.0',
            description: 'Datos iniciales generados desde sistema.js'
        });

        console.log('✅ ¡DATOS SUBIDOS EXITOSAMENTE A FIRESTORE!');
        console.log(`   Colección: baseDatosV2`);
        console.log(`   Documento: datos`);
        console.log(`   Total items: ${totalItems}`);
        console.log(`   Categorías: ${Object.keys(resumen).join(', ')}`);
        
        // También guardar un archivo JSON local como respaldo
        const fs = require('fs');
        const jsonPath = path.join(__dirname, '..', 'backup-base-datos-v2.json');
        fs.writeFileSync(jsonPath, JSON.stringify({ items: datosIniciales, generatedAt: new Date().toISOString() }, null, 2));
        console.log(`\n💾 Respaldo guardado en: backup-base-datos-v2.json`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error durante la población:', error);
        process.exit(1);
    }
}

poblarBaseDatos();
