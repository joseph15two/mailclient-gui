import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

class Auth {
  constructor() {
    this.auth = getAuth();
    this.gauthProvider = new GoogleAuthProvider();
    this.user = null;

    this.onAuthStateChanged = undefined;
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user
      }
      else {
        this.user = null
      }
      this.onAuthStateChanged?.(user)
    })

    this.gauthProvider.addScope("https://mail.google.com/");
  }
  
  bindSignOut(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => signOut(this.auth));
  }

  bindLogin(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => {
      this.openLoginPopup();
    });
  }

  openLoginPopup() {
    signInWithPopup(this.auth, this.gauthProvider)
      .then(result=>{
        // set a cookie that expires in an hour
        Auth.setCookie("oauthToken", result._tokenResponse.oauthAccessToken, "/", new Date(Date.now() + 3600*1000));
        window.location.assign("/mail-page/mail.html")
      });
  }

  static setCookie(cookie, value, path = "/", exp = null) {
    let v = cookie + "=" + value + ";" + "path=" + path;
    if (exp)
      v += ";expires=" + exp.toUTCString()
    document.cookie = v;
  }

  static getCookie(cookie) {
    return (document.cookie.split("; ").map(v=>v.split("=")).find(v=>v[0]==cookie))?.[1]
  }
}

export { Auth };