// imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from "./config.js";
import { Auth } from './auth.js'

class System {
  constructor() {
    // inifalize firebase app
    this.app = initializeApp(firebaseConfig);
    // get the db for firebase
    this.db = getDatabase(this.app);
    this.authApp = new Auth();
    // cookies used for storing oauth token when user logs in
    System.getCookie = Auth.getCookie
    System.setCookie = Auth.setCookie
  }
}



export { System };