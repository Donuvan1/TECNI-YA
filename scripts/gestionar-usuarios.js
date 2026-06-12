/**
 * SCRIPT PARA GESTIONAR USUARIOS DE FIREBASE
 * 
 * Este script te permite:
 *   1. LISTAR todos los usuarios (Authentication + Firestore)
 *   2. BORRAR usuarios que no sean "donuvaner"
 *   3. Hacer que "donuvaner" sea ADMINISTRADOR
 * 
 * EJECUTAR: node scripts/gestionar-usuarios.js
 * 
 * MODOS DE USO:
 *   - Modo lista (seguro):  node scripts/gestionar-usuarios.js
 *   - Modo borrar:          node scripts/gestionar-usuarios.js --borrar
 *   - Modo borrar (fuerza): node scripts/gestionar-usuarios.js --borrar --force
 * 
 * REQUISITOS:
 *   Tener serviceAccountKey.json en la raíz del proyecto
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ========== CONFIGURACIÓN ==========
const USUARIO_ADMIN = 'donuvaner'; // Este usuario se conservará y será admin

// ========== INICIALIZAR FIREBASE ADMIN ==========
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ No se encuentra serviceAccountKey.json');
    console.log('\nPara obtenerlo:');
    console.log('1. Ve a https://console.firebase.google.com');
    console.log('2. Selecciona tu proyecto: proyecto-libertad-38c2a');
    console.log('3. Ve a Project Settings > Service Accounts');
    console.log('4. Haz clic en "Generate New Private Key"');
    console.log('5. Guarda el archivo como "serviceAccountKey.json" en la raíz del proyecto');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// ========== FUNCIONES ==========

/**
 * Lista todos los usuarios de Firebase Authentication
 */
async function listarUsuariosAuth() {
    console.log('\n📋 USUARIOS EN FIREBASE AUTHENTICATION:');
    console.log('='.repeat(70));
    
    const usuarios = [];
    let nextPageToken;
    let total = 0;
    
    do {
        const result = await auth.listUsers(100, nextPageToken);
        result.users.forEach(user => {
            total++;
            usuarios.push({
                uid: user.uid,
                email: user.email || '(sin email)',
                displayName: user.displayName || '(sin nombre)',
                disabled: user.disabled,
                createdAt: new Date(user.metadata.creationTime).toLocaleString(),
                lastSignIn: new Date(user.metadata.lastSignInTime).toLocaleString()
            });
            console.log(`\n  👤 Usuario #${total}:`);
            console.log(`     UID:         ${user.uid}`);
            console.log(`     Email:       ${user.email || '(sin email)'}`);
            console.log(`     Nombre:      ${user.displayName || '(sin nombre)'}`);
            console.log(`     Teléfono:    ${user.phoneNumber || '(sin teléfono)'}`);
            console.log(`     Creado:      ${new Date(user.metadata.creationTime).toLocaleString()}`);
            console.log(`     Último login: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`);
            console.log(`     Deshabilitado: ${user.disabled ? 'SÍ ⛔' : 'No ✅'}`);
        });
        nextPageToken = result.pageToken;
    } while (nextPageToken);
    
    if (total === 0) {
        console.log('   No hay usuarios en Authentication.');
    }
    
    console.log(`\n📊 Total en Authentication: ${total} usuarios`);
    return usuarios;
}

/**
 * Lista todos los documentos en la colección "usuarios" de Firestore
 */
async function listarUsuariosFirestore() {
    console.log('\n\n📋 USUARIOS EN FIRESTORE (colección "usuarios"):');
    console.log('='.repeat(70));
    
    const snapshot = await db.collection('usuarios').get();
    let total = 0;
    const usuarios = [];
    
    snapshot.forEach(doc => {
        total++;
        const data = doc.data();
        usuarios.push({
            id: doc.id,
            ...data
        });
        console.log(`\n  📄 Documento #${total}:`);
        console.log(`     ID:           ${doc.id}`);
        console.log(`     Nombre:       ${data.nombre || '(sin nombre)'}`);
        console.log(`     Email:        ${data.email || '(sin email)'}`);
        console.log(`     Teléfono:     ${data.telefono || '(sin teléfono)'}`);
        console.log(`     Rol:          ${data.rol || 'usuario'}`);
        console.log(`     Admin:        ${data.esAdmin ? 'SÍ 👑' : 'No'}`);
        console.log(`     FCM Tokens:   ${(data.fcmTokens || []).length} tokens`);
        console.log(`     Creado:       ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : '(desconocido)'}`);
    });
    
    if (total === 0) {
        console.log('   No hay documentos en la colección "usuarios".');
    }
    
    console.log(`\n📊 Total en Firestore: ${total} documentos`);
    return usuarios;
}

/**
 * Lista los documentos de baseDatosV2 (cada usuario tiene su propia BD)
 */
async function listarBasesDeDatos() {
    console.log('\n\n📋 BASES DE DATOS POR USUARIO (colección "baseDatosV2"):');
    console.log('='.repeat(70));
    
    const snapshot = await db.collection('baseDatosV2').get();
    let total = 0;
    
    snapshot.forEach(doc => {
        total++;
        const data = doc.data();
        const items = data.items || {};
        let totalItems = 0;
        Object.keys(items).forEach(key => {
            totalItems += (items[key] || []).length;
        });
        console.log(`\n  📦 Documento #${total}:`);
        console.log(`     ID:           ${doc.id}`);
        console.log(`     Items totales: ${totalItems}`);
        console.log(`     Categorías:    ${Object.keys(items).length}`);
        console.log(`     Actualizado:   ${data.updatedAt || '(desconocido)'}`);
        console.log(`     Código diario: ${data.codigoDiario || '(sin código)'}`);
    });
    
    if (total === 0) {
        console.log('   No hay documentos en baseDatosV2.');
    }
    
    console.log(`\n📊 Total en baseDatosV2: ${total} documentos`);
}

/**
 * Borra un usuario de Firebase Authentication por UID
 */
async function borrarUsuarioAuth(uid, email) {
    try {
        await auth.deleteUser(uid);
        console.log(`   ✅ Usuario de Authentication eliminado: ${email || uid}`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error al eliminar usuario ${uid} de Authentication:`, error.message);
        return false;
    }
}

/**
 * Borra un documento de la colección "usuarios" en Firestore
 */
async function borrarUsuarioFirestore(docId) {
    try {
        await db.collection('usuarios').doc(docId).delete();
        console.log(`   ✅ Documento de Firestore eliminado: ${docId}`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error al eliminar documento ${docId} de Firestore:`, error.message);
        return false;
    }
}

/**
 * Borra la base de datos de un usuario en baseDatosV2
 */
async function borrarBaseDatosUsuario(uid) {
    try {
        await db.collection('baseDatosV2').doc(uid).delete();
        console.log(`   ✅ Base de datos de ${uid} eliminada de baseDatosV2`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error al eliminar base de datos de ${uid}:`, error.message);
        return false;
    }
}

/**
 * Busca datos del usuario en Firestore por email o nombre
 */
async function buscarEnFirestore(uid, email, displayName) {
    // Buscar por ID del documento (que podría ser el UID)
    const docRef = db.collection('usuarios').doc(uid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { id: uid, data: docSnap.data(), encontrado: true };
    }
    
    // Buscar por email
    if (email) {
        const snapshot = await db.collection('usuarios').where('email', '==', email).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, data: doc.data(), encontrado: true };
        }
    }
    
    // Buscar por nombre
    if (displayName) {
        const snapshot = await db.collection('usuarios').where('nombre', '==', displayName).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, data: doc.data(), encontrado: true };
        }
    }
    
    return { id: null, data: null, encontrado: false };
}

/**
 * Hace que un usuario sea administrador
 */
async function hacerAdmin(uid, email, displayName) {
    console.log(`\n👑 Haciendo ADMIN a: ${email || displayName || uid}`);
    
    // 1. Buscar en Firestore
    const result = await buscarEnFirestore(uid, email, displayName);
    
    if (result.encontrado) {
        // Actualizar el documento existente
        await db.collection('usuarios').doc(result.id).update({
            esAdmin: true,
            rol: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Documento en Firestore actualizado: ${result.id} → esAdmin: true`);
    } else {
        // Crear un nuevo documento
        const nuevoDoc = {
            uid: uid,
            email: email || '',
            nombre: displayName || email || 'Administrador',
            esAdmin: true,
            rol: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('usuarios').doc(uid).set(nuevoDoc);
        console.log(`   ✅ Nuevo documento creado en Firestore: ${uid} → esAdmin: true`);
    }
    
    // 2. Poner un custom claim en Authentication
    try {
        await auth.setCustomUserClaims(uid, { esAdmin: true, rol: 'admin' });
        console.log(`   ✅ Custom claims actualizados en Authentication`);
    } catch (error) {
        console.error(`   ❌ Error al actualizar custom claims:`, error.message);
    }
    
    return true;
}

/**
 * Función principal
 */
async function main() {
    const args = process.argv.slice(2);
    const modoBorrar = args.includes('--borrar');
    const modoForce = args.includes('--force');
    
    console.log('🚀 SCRIPT DE GESTIÓN DE USUARIOS');
    console.log('='.repeat(70));
    console.log(`📌 Usuario ADMIN a conservar: "${USUARIO_ADMIN}"`);
    console.log(`🔧 Modo: ${modoBorrar ? (modoForce ? 'BORRAR (FORZADO)' : 'BORRAR (con confirmación)') : 'SOLO LISTAR (seguro)'}`);
    console.log('='.repeat(70));
    
    try {
        // 1. Listar usuarios de Authentication
        const usuariosAuth = await listarUsuariosAuth();
        
        // 2. Listar usuarios de Firestore
        const usuariosFirestore = await listarUsuariosFirestore();
        
        // 3. Listar bases de datos por usuario
        await listarBasesDeDatos();
        
        // 4. Si estamos en modo borrar
        if (modoBorrar) {
            console.log('\n\n⚠️  INICIANDO PROCESO DE BORRADO');
            console.log('='.repeat(70));
            
            let usuariosABorrar = [];
            let usuarioAdmin = null;
            
            // Identificar usuarios a borrar de Authentication
            for (const user of usuariosAuth) {
                const email = user.email || '';
                const displayName = user.displayName || '';
                const uid = user.uid;
                
                // Verificar si este usuario es "donuvaner"
                const esDonuvaner = 
                    email.toLowerCase().includes(USUARIO_ADMIN.toLowerCase()) ||
                    displayName.toLowerCase().includes(USUARIO_ADMIN.toLowerCase());
                
                if (esDonuvaner) {
                    usuarioAdmin = user;
                    console.log(`\n🔵 CONSERVANDO: ${email || displayName || uid} → será ADMIN 👑`);
                } else {
                    usuariosABorrar.push({
                        uid: uid,
                        email: email,
                        displayName: displayName,
                        origen: 'Authentication'
                    });
                }
            }
            
            if (usuariosABorrar.length === 0) {
                console.log('\n✅ No hay usuarios para borrar. Solo está "donuvaner".');
            } else {
                console.log(`\n⚠️  Se borrarán ${usuariosABorrar.length} usuarios:`);
                usuariosABorrar.forEach((u, i) => {
                    console.log(`   ${i + 1}. ${u.email || u.displayName || u.uid}`);
                });
                
                // Confirmación (a menos que sea --force)
                if (!modoForce) {
                    console.log('\n⚠️  Para confirmar el borrado, ejecuta:');
                    console.log(`   node scripts/gestionar-usuarios.js --borrar --force`);
                    console.log('\n⚠️  O escribe "BORRAR" y presiona Enter:');
                    
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    
                    const respuesta = await new Promise((resolve) => {
                        rl.question('> ', (answer) => {
                            resolve(answer.trim());
                        });
                    });
                    rl.close();
                    
                    if (respuesta !== 'BORRAR') {
                        console.log('\n❌ Operación cancelada.');
                        process.exit(0);
                    }
                }
                
                // Proceder con el borrado
                console.log('\n🗑️  BORRANDO USUARIOS...\n');
                
                let borrados = 0;
                let errores = 0;
                
                for (const usuario of usuariosABorrar) {
                    console.log(`\n📌 Procesando: ${usuario.email || usuario.displayName || usuario.uid}`);
                    
                    // Borrar de Authentication
                    const authOk = await borrarUsuarioAuth(usuario.uid, usuario.email);
                    if (authOk) borrados++;
                    else errores++;
                    
                    // Buscar y borrar de Firestore (colección "usuarios")
                    const firestoreResult = await buscarEnFirestore(usuario.uid, usuario.email, usuario.displayName);
                    if (firestoreResult.encontrado) {
                        const fsOk = await borrarUsuarioFirestore(firestoreResult.id);
                        if (fsOk) borrados++;
                        else errores++;
                    }
                    
                    // Borrar su base de datos en baseDatosV2
                    const bdOk = await borrarBaseDatosUsuario(usuario.uid);
                    if (bdOk) borrados++;
                    else errores++;
                }
                
                console.log('\n' + '='.repeat(70));
                console.log('📊 RESUMEN DE BORRADO:');
                console.log(`   ✅ Operaciones exitosas: ${borrados}`);
                console.log(`   ❌ Errores: ${errores}`);
                console.log('='.repeat(70));
            }
            
            // 5. Hacer admin a donuvaner
            if (usuarioAdmin) {
                console.log('\n\n👑 CONFIGURANDO ADMINISTRADOR');
                console.log('='.repeat(70));
                await hacerAdmin(
                    usuarioAdmin.uid,
                    usuarioAdmin.email,
                    usuarioAdmin.displayName
                );
                console.log('\n✅ donuvaner ahora es ADMINISTRADOR 👑');
            } else {
                console.log('\n\n⚠️  No se encontró a "donuvaner" en Authentication.');
                console.log('   Primero debe iniciar sesión al menos una vez.');
            }
            
        } else {
            console.log('\n\n💡 Para BORRAR los usuarios (excepto "donuvaner") y configurar admin:');
            console.log('   node scripts/gestionar-usuarios.js --borrar');
            console.log('\n   Para borrar sin confirmación:');
            console.log('   node scripts/gestionar-usuarios.js --borrar --force');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error general:', error);
        process.exit(1);
    }
}

main();
