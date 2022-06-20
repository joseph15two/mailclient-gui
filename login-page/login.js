import { System } from "/firebase/system.js"; //???

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

//import { userInstance } from "/imap.js"; //???

class LoginPage {
    constructor() {
        this.system = new System();
        this.bindLogin();
    }

    bindLogin() {
        const login = document.getElementById("login-btn");
        login.addEventListener("click", (e) => this.handleLogin(e))
    }

    handleLogin(e) {
      this.system.authApp.openLoginPopup()
      return;
    }

}

new LoginPage();
