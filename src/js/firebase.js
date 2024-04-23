import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

/**
 * Configuração do Firebase.
 *
 * @type {Object} firebaseConfig - As configurações do Firebase.
 * @property {string} apiKey - A chave da API do Firebase.
 * @property {string} authDomain - O domínio de autenticação do Firebase.
 * @property {string} projectId - O ID do projeto do Firebase.
 * @property {string} storageBucket - O bucket de armazenamento do Firebase.
 * @property {string} messagingSenderId - O ID do remetente de mensagens do Firebase.
 * @property {string} appId - O ID do aplicativo do Firebase.
 * @property {string} measurementId - O ID de medição do Firebase.
 */
const firebaseConfig = {
  apiKey: "AIzaSyArU2bsS9eit7KD2Clz93ckDGeec3C8tdA",
  authDomain: "es-project-c1be3.firebaseapp.com",
  projectId: "es-project-c1be3",
  storageBucket: "es-project-c1be3.appspot.com",
  messagingSenderId: "246161791636",
  appId: "1:246161791636:web:2bb70acfbc3f6020d6f281",
  measurementId: "G-CN63SNSVDS",
};

/**
 * Inicializa o aplicativo Firebase com a configuração fornecida.
 *
 * @type {Object} app - O objeto de aplicativo inicializado do Firebase.
 */
export const app = initializeApp(firebaseConfig);

/**
 * Obtém uma referência para o serviço de armazenamento do Firebase usando o aplicativo inicializado.
 *
 * @type {Object} storage - O serviço de armazenamento do Firebase.
 */
export const storage = getStorage(app);
