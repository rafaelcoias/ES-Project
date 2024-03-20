import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArU2bsS9eit7KD2Clz93ckDGeec3C8tdA",
  authDomain: "es-project-c1be3.firebaseapp.com",
  projectId: "es-project-c1be3",
  storageBucket: "es-project-c1be3.appspot.com",
  messagingSenderId: "246161791636",
  appId: "1:246161791636:web:2bb70acfbc3f6020d6f281",
  measurementId: "G-CN63SNSVDS",
};
// Inicializa o aplicativo Firebase com a configuração fornecida
export const app = initializeApp(firebaseConfig);

// Obtém uma referência para o serviço de armazenamento do Firebase usando o aplicativo inicializado
export const storage = getStorage(app);
