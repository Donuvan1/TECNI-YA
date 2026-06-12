const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.pushMensajeNuevo = functions.firestore
  .onDocumentCreated('chats/{chatId}/mensajes/{mensajeId}', async (event) => {
    const mensaje = event.data?.data();
    const { chatId, mensajeId } = event.params;

    console.log("Nuevo mensaje detectado:", mensajeId, "en chat:", chatId);

    if (!mensaje?.para || !mensaje?.de) {
      console.log("Mensaje sin destinatario o remitente, se omite notificación");
      return null;
    }

    try {
      const destinatarioRef = admin.firestore().doc(`usuarios/${mensaje.para}`);
      const destinatarioSnap = await destinatarioRef.get();

      if (!destinatarioSnap.exists) {
        console.log("Destinatario no encontrado");
        return null;
      }

      const destinatarioData = destinatarioSnap.data();
      const fcmTokens = destinatarioData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log("El destinatario no tiene tokens FCM registrados");
        return null;
      }

      const remitenteRef = admin.firestore().doc(`usuarios/${mensaje.de}`);
      const remitenteSnap = await remitenteRef.get();
      const nombreRemitente = remitenteSnap.exists
        ? (remitenteSnap.data().nombre || remitenteSnap.data().email || "Alguien")
        : "Alguien";

      let textoNotificacion = "";
      if (mensaje.tipo === "imagen") {
        textoNotificacion = "📷 Te envió una imagen";
      } else if (mensaje.tipo === "audio") {
        textoNotificacion = "🎤 Te envió un mensaje de voz";
      } else if (mensaje.tipo === "ubicacion") {
        textoNotificacion = "📍 Te compartió una ubicación";
      } else {
        textoNotificacion = mensaje.texto || "Te envió un mensaje";
      }

      const payload = {
        notification: {
          title: `💬 ${nombreRemitente}`,
          body: textoNotificacion,
          icon: "https://ui-avatars.com/api/?background=0a84ff&color=fff&bold=true&size=192&name=T",
          click_action: "https://proyecto-libertad-38c2a.web.app",
          badge: "1",
          vibrate: [200, 100, 200]
        },
        data: {
          chatId: chatId,
          mensajeId: mensajeId,
          de: mensaje.de,
          para: mensaje.para,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      };

      const resultados = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        ...payload
      });

      console.log(`Notificaciones enviadas: ${resultados.successCount} exitosas, ${resultados.failureCount} fallidas`);

      if (resultados.failureCount > 0) {
        const tokensInvalidos = [];
        resultados.responses.forEach((resp, index) => {
          if (!resp.success) {
            const errorCode = resp.error.code;
            if (errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered') {
              tokensInvalidos.push(fcmTokens[index]);
            }
          }
        });

        if (tokensInvalidos.length > 0) {
          console.log(`Limpiando ${tokensInvalidos.length} tokens inválidos...`);
          await destinatarioRef.update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensInvalidos)
          });
        }
      }

      return null;
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      return null;
    }
  });

/**
 * Cloud Function para eliminar un usuario (solo admin)
 * Llamada desde el frontend: https://us-central1-proyecto-libertad-38c2a.cloudfunctions.net/eliminarUsuario
 */
exports.eliminarUsuario = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario que llama está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const adminUid = context.auth.uid;
  const uidAEliminar = data.uid;

  if (!uidAEliminar) {
    throw new functions.https.HttpsError('invalid-argument', 'Se requiere el UID del usuario a eliminar');
  }

  // Verificar que quien llama es admin
  const adminRef = admin.firestore().doc(`usuarios/${adminUid}`);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists || adminSnap.data().esAdmin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'No tienes permisos de administrador');
  }

  // No permitir eliminarse a sí mismo
  if (adminUid === uidAEliminar) {
    throw new functions.https.HttpsError('invalid-argument', 'No puedes eliminarte a ti mismo');
  }

  try {
    // 1. Eliminar de Authentication
    await admin.auth().deleteUser(uidAEliminar);
    console.log(`✅ Usuario ${uidAEliminar} eliminado de Authentication`);

    // 2. Eliminar documento de Firestore (colección "usuarios")
    await admin.firestore().doc(`usuarios/${uidAEliminar}`).delete();
    console.log(`✅ Documento de ${uidAEliminar} eliminado de Firestore`);

    // 3. Eliminar base de datos del usuario (colección "baseDatosV2")
    const baseDatosRef = admin.firestore().doc(`baseDatosV2/${uidAEliminar}`);
    const baseDatosSnap = await baseDatosRef.get();
    if (baseDatosSnap.exists) {
      await baseDatosRef.delete();
      console.log(`✅ Base de datos de ${uidAEliminar} eliminada`);
    }

    return { success: true, mensaje: `Usuario eliminado correctamente` };
  } catch (error) {
    console.error(`❌ Error al eliminar usuario ${uidAEliminar}:`, error);
    throw new functions.https.HttpsError('internal', 'Error al eliminar el usuario');
  }
});

