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
