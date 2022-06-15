import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

class Auth {
  constructor() {
    this.auth = getAuth();
    this.user = null;
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user
      }
      else {
        this.user = null
      }
    })
  }
  
  bindSignOut(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => signOut(this.auth));
  }
}

export { Auth };