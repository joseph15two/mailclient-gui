// imports
import { System } from "/firebase/system.js"; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";



class LoginPage {
    constructor() {
        this.system = new System();
        this.bindLogin();
    }
    // binds login button
    bindLogin() {
        const login = document.getElementById("login-btn");
        login.addEventListener("click", (e) => this.handleLogin(e))
    }
    // handles login by opening a new popup for authentication
    handleLogin(e) {
      this.system.authApp.openLoginPopup()
      return;
    }

}

new LoginPage();
