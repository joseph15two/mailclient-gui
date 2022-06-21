// imports
import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

class Auth {
  constructor() {
    // get new auth object from firebase
    this.auth = getAuth();
    // get new googleauth provider
    this.gauthProvider = new GoogleAuthProvider();
    this.user = null;

    this.onAuthStateChanged = undefined;
    // checks if user has logged in
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user
      }
      else {
        this.user = null
      }
      this.onAuthStateChanged?.(user);
    })

    this.gauthProvider.addScope("https://mail.google.com/");
  }
  // binds sign out button
  bindSignOut(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => signOut(this.auth));
  }
  // binds login button
  bindLogin(id) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => {
      this.openLoginPopup();
    });
  }
  // opens a popup window with google provider to log in
  openLoginPopup() {
    signInWithPopup(this.auth, this.gauthProvider)
      .then(result=>{
        // set a cookie that expires in an hour
        Auth.setCookie("oauthToken", result._tokenResponse.oauthAccessToken, "/", new Date(Date.now() + 3600*1000));
        window.location.assign("/mail-page/mail.html")
      });
  }
  // function to set cookies
  static setCookie(cookie, value, path = "/", exp = null) {
    let v = cookie + "=" + value + ";" + "path=" + path;
    if (exp)
      v += ";expires=" + exp.toUTCString()
    document.cookie = v;
  }
  // function that accesses cookies
  static getCookie(cookie) {
    return (document.cookie.split("; ").map(v=>v.split("=")).find(v=>v[0]==cookie))?.[1]
  }
}

export { Auth };