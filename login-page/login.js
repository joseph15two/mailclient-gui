import { System } from "./firebase/system.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

import { userInstance } from "./imap.js";

class LoginPage {
    constructor() {
        this.system = new System();
        this.bindLogin();
    }

    bindLogin() {
        const login = document.getElementById("login-btn");
        login.addEventListener("submit", (e) => this.handleLogin(e))
    }

    handleLogin(e) {
        e.preventDefault();
        console.log("trying to login")
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email !== '' && password !== '') {
            signInWithEmailAndPassword(this.system.authApp.auth, email, password).then(() => {
                console.log("Login successful");
                return new userInstance(email, password, this.system.app)
            })
                .catch((error) => {
                    window.alert(error.code)
                })
        }
    }

}

new LoginPage();