import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { set, ref } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { System } from "./firebase/system.js";


class Register {
  constructor() {
    this.system = new System();
    this.bindRegister();
  }

  bindRegister() {
    const register = document.getElementById("register");
    register.addEventListener("submit", (e) => this.handleRegister(e))
  }

  handleRegister(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email !== "" & password !== "") {
      createUserWithEmailAndPassword(this.system.authApp.auth, email, password)
        .then((userCredential) => {
          
          const user = userCredential.user;
          set(ref(this.system.db, `users/${user.uid}`), {
            fName,
            lName
          })
            .then(() => {
              window.location.assign('index.html');
            })

        })
        .catch((error) => window.alert(error));
    }
  }
}

new Register();