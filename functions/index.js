const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.pruebaMensaje = functions.firestore
  .document('chats/{chatId}/mensajes/{mensajeId}')
  .onCreate((snap, context) => {
    console.log("NUEVO MENSAJE DETECTADO!");
    console.log("Chat ID:", context.params.chatId);
    console.log("Mensaje ID:", context.params.mensajeId);
    console.log("Datos del mensaje:", snap.data());
    return null;
  });