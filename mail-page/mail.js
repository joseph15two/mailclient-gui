import { System } from "/firebase/system.js";

const mailItemTemplate = document.getElementById("mail-item-template");

let system = new System();

class MailSystem {
  constructor() {
    this.currentInbox;
    this.checkOAuthToken()


    this.bindListeners();

    system.authApp.onAuthStateChanged = _ => {
      document.querySelector(".popupContainer").innerHTML = "";
      this.refreshInbox()
      //this.testsendsmtp();
    }
  }

  checkOAuthToken() {
    if (!System.getCookie("oauthToken")) {
      let popup = this.createPopupPanel({
        content: "Your session has expired. Sending you to the login page in 3 seconds."
      })
      setTimeout(_=>{
        window.location.assign("/index.html")
      }, 3500)
    }
  }

  // Bind all the listeners
  bindListeners() {
    document.getElementById("mail-compose").addEventListener("click", e => {
      this.toggleComposeBox();
    });
    document.querySelector(".composeSubmit").addEventListener("click", e => {
      this.handleCompose();
    });

    let pageInput = document.querySelector(".pageInput")
    pageInput.addEventListener("change", e=>{
      this.refreshInbox()
    })

    let clearNavSelection = _=>{
      navs.forEach(v=>{
        v.dataset.selected = false
      })
    }
    let navs = document.querySelectorAll(".nav-item[data-address]")
    navs.forEach(box=>{
      box.addEventListener("click", _=>{
        if (box.dataset.selected == "true")
          return;
        clearNavSelection()
        box.dataset.selected = true;
        pageInput.value = 1;
        this.refreshInbox();
      })
    })
  }

  getNavigationInbox() {
    let navs = Array.from(document.querySelectorAll(".nav-item[data-address]"));
    return navs.find(box=>box.dataset.selected == "true").dataset.address;
  }

  getPageNumber() {
    return document.querySelector(".pageInput").value;
  }

  toggleComposeBox() {
    let elem = document.querySelector(".composeWindow")
    if (elem.dataset.active == "true")
      elem.dataset.active = false
    else
      elem.dataset.active = true
  }

  // Handle the compose being submitted; send an email
  handleCompose() {
    let inputs = Array.from(document.querySelectorAll(".composeWindow form textarea")).map(v=>v.value);
    this.sendMail({
      to: inputs[0],
      subject: inputs[1],
      body: inputs[2],
      from: system.authApp.user.email
    })
  }

  // Send the email
  async sendMail(data) {
    return new Promise((res, rej) => {
      let req = new XMLHttpRequest();
      req.open("POST", "https://SMTPTest.lioliver.repl.co")
      req.send(JSON.stringify({
        type: "smtp",
        action: "sendMail",
        data: data,
        accessToken: System.getCookie("oauthToken")
      }))
      // log after finished
      req.onreadystatechange = _ => {
        if (req.readyState === 4)
          res()
      }
    })
  }

  // Retrieve more details about a certain mail using its uid
  async fetchMailInfo(uid) {
    return new Promise((res, rej) => {
      let req = new XMLHttpRequest();
      req.open("POST", "https://SMTPTest.lioliver.repl.co")
      req.send(JSON.stringify({
        type: "imap",
        action: "getMail",
        uid: uid,
        accessToken: System.getCookie("oauthToken"),
      }))
      console.log(req)
      // log after finished
      req.onreadystatechange = _ => {
        if (req.readyState === 4)
          res(JSON.parse(req.responseText))
      }
    })
  }

  createPopupPanel({
    isPanel = true,
    width = "50vw",
    height = "50vh",
    backgroundColor = "#3c3c3c",
    closable = true,
    content = null
  }) {
    let popupMain = document.createElement("div");
    let btnCont = document.createElement("div");
    btnCont.classList.add("popup-close-container")
    let elem = document.createElement("div");
    document.querySelector(".popupContainer").appendChild(elem);
    if (isPanel)
      elem.classList.add("popupPanel")

    elem.popupCloseHandler = ()=>{
      popupMain.remove();
    }

    if (closable) {
      let btn = btnCont.appendChild(document.createElement("button"));
      btn.innerText = "X"
      btn.classList.add("closeButton")
      btn.addEventListener("click", elem.popupCloseHandler)
      if (backgroundColor === "#ffffff")
        btn.style.color =  "black";
    }

    if (content) {
      elem.cont = elem.appendChild(document.createElement("div"))
      elem.cont.innerText = content
      elem.cont.classList.add("popupContent")
      if (backgroundColor === "#ffffff")
        elem.cont.style.color = "black";
    } 
    
    elem.style.width = width;
    elem.style.height = height;
    elem.style.backgroundColor = backgroundColor;
    popupMain.appendChild(btnCont);
    popupMain.appendChild(elem);
    document.querySelector(".popupContainer").appendChild(popupMain);
    return elem;
  }

  // Asynchronously retrieves the inbox
  async fetchInbox() {
    return new Promise((res, rej) => {
      let req = new XMLHttpRequest();
      req.open("POST", "https://SMTPTest.lioliver.repl.co")
      req.send(JSON.stringify({
        type: "imap",
        action: "getInbox",
        email: system.authApp.user.email,
        user: system.authApp.user,
        refToken: system.authApp.user.refreshToken,
        accessToken: System.getCookie("oauthToken"),
        opts: {
          box: this.getNavigationInbox() || "All Mail",
          page: this.getPageNumber() || 1
        }
      }))
      // log after finished
      req.onreadystatechange = _ => {
        if (req.readyState === 4)
          res(req)
      }
    })
  }

  // Refreshes and displays the inbox; this is the top level one you want to call
  refreshInbox() {
    let mailContainer = document.querySelector(".mail-list");
    mailContainer.innerHTML = "";
    this.fetchInbox().then(v => {
      if (v.status != 200)
        throw new Error("Recieved invalid response from server")
      return JSON.parse(v.responseText);
    }).then(v => {
      console.log(v)
      this.currentInbox = v;
      this.displayInbox(v)
    }).catch(e=>{
      console.log(e)
      this.createPopupPanel({
        content: e
      })
    })
  }

  // Displays the inbox data given
  displayInbox(inbox) {
    let mailContainer = document.querySelector(".mail-list");
    mailContainer.innerHTML = "";
    for (let i = inbox.length - 1; i >= 0; i--) {
      mailContainer.appendChild(this.createMailElement({
        subject: inbox[i].subject?.[0],
        author: inbox[i].from?.[0],
        date: inbox[i]?.date?.[0]?.slice(0, -15),
        uid: inbox[i].uid
      }));
    }
  }

  // Creates an element for displaying the header of a mail
  createMailElement(opts = {
    subject: "No subject",
    author: "Unknown author",
    date: "Unknown date",
    uid: 0
  }) {
    let elem = mailItemTemplate.cloneNode(true).content.children[0]
    elem.querySelector(".subject-field").innerText = opts.subject;
    elem.querySelector(".author-field").innerText = opts.author;
    elem.querySelector(".date-field").innerText = opts.date;
    elem.dataset.uid = opts.uid;

    elem.querySelector(".subject-field").parentElement.addEventListener("click", e => {
      this.viewMail(elem.dataset.uid);
    });

    return elem
  }

  viewMail(uid) {
    let popup = this.createPopupPanel({
      content: " ",
      width: "80vw",
      height: "80vh",
      backgroundColor: "#ffffff"
    })
    this.fetchMailInfo(uid).then(v=>{
      //console.log(v)
      popup.cont.innerHTML += "<p>To: </p>" + v.to.html
      popup.cont.innerHTML += "<p>From: </p>" + v.from.html
      let iframe = document.createElement("iframe");
      iframe.addEventListener("load", _=>{window.resizeIframe(iframe)})
      if (v.html) {
        iframe.srcdoc = v.html;
      } else {
        iframe.srcdoc = v.textAsHtml;
      }
      popup.cont.appendChild(iframe)
    })
  }

  async testsendsmtp() {
    let req = new XMLHttpRequest();
    req.open("POST", "https://SMTPTest.lioliver.repl.co")
    req.send(JSON.stringify({
      type: "smtp",
      action: "test",
      email: system.authApp.user.email,
      user: system.authApp.user,
      refToken: system.authApp.user.refreshToken,
      accessToken: System.getCookie("oauthToken")
    }))
    // log after finished
    req.onreadystatechange = _ => {
      if (req.readyState === 4)
        console.log(req)
    }
  }
}

window.resizeIframe = function(iframe) {
  iframe.height = Math.max(iframe.contentWindow.document.body.scrollHeight, 128) + "px";
} 

let mailsystem = new MailSystem();

let collapse = document.getElementsByClassName("collapse");

for (let i = 0; i < collapse.length; i++) {
    collapse[i].addEventListener("click", function() {
        let icon = document.querySelector(".more-icon");
        icon.classList.toggle("active");
       
        let content = this.nextElementSibling;
     
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } 
        else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}