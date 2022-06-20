import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from "./config.js";
import { Auth } from './auth.js'

class System {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.authApp = new Auth();
    
    System.getCookie = Auth.getCookie
    System.setCookie = Auth.setCookie
  }
}



export { System };