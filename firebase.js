// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB4W_0bdRoL-VnN6FAiSWhnQWNO-fRairc",
  authDomain: "proyecto-libertad-38c2a.firebaseapp.com",
  projectId: "proyecto-libertad-38c2a",
  storageBucket: "proyecto-libertad-38c2a.firebasestorage.app",
  messagingSenderId: "115380076439",
  appId: "1:115380076439:web:85383b2c32cdb40c798ed2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'TECNI-YA';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuevo mensaje',
    icon: 'https://ui-avatars.com/api/?background=0a84ff&color=fff&bold=true&size=192&name=T',
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});