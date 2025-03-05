// firebaseConfig.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC8KFCi2vQPnmYQ6Kf7WW7eAlHcIbSYKZY",
  authDomain: "videos-downloader-13024.firebaseapp.com",
  projectId: "videos-downloader-13024",
  storageBucket: "videos-downloader-13024.appspot.com",
  messagingSenderId: "1062145262228",
  appId: "1:1062145262228:ios:82a65613810b29f5ddaa81",
  databaseURL: "https://videos-downloader-13024-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Ensure Firebase is only initialized once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
