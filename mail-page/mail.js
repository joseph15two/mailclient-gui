//import necessary modules
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

  // checks if the oauth token used to login is still valid
  checkOAuthToken() {
    // checks if the user still has an ouath toke in their cookies
    if (!System.getCookie("oauthToken")) {
      let popup = this.createPopupPanel({
        content: "Your session has expired. Sending you to the login page in 3 seconds."
      })
      // redirect user back to main page after approx 3 seconds
      setTimeout(_=>{
        window.location.assign("/index.html")
      }, 3000)
    }
  }

  // Bind all the listeners
  bindListeners() {
    // adds a click event listener for the compose button
    document.getElementById("mail-compose").addEventListener("click", e => {
      this.toggleComposeBox();
    });
    // adds a click event listener for the send button in the compose window
    document.querySelector(".composeSubmit").addEventListener("click", e => {
      this.handleCompose();
    });
    // get the page navigation input element
    let pageInput = document.querySelector(".pageInput")
    // detects changes in value of the page navigation input and refreshes the inbox when there is change
    pageInput.addEventListener("change", e=>{
      this.refreshInbox()
    })
    // for clearing selection of side panel nav item
    let clearNavSelection = _=>{
      navs.forEach(v=>{
        v.dataset.selected = false
      })
    }
    // select all navigation items in the sidepanel
    let navs = document.querySelectorAll(".nav-item[data-address]")
    // adds a click event listener for each nav item that will switch to approriate page
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
  // get mail items depending on which button the user has selected in the side panel navigation
  getNavigationInbox() {
    let navs = Array.from(document.querySelectorAll(".nav-item[data-address]"));
    return navs.find(box=>box.dataset.selected == "true").dataset.address;
  }
  // get the current page number for the page navigation of mail list
  getPageNumber() {
    return document.querySelector(".pageInput").value;
  }
  // open or close the compose window 
  toggleComposeBox() {
    let elem = document.querySelector(".composeWindow")
    if (elem.dataset.active == "true")
      elem.dataset.active = false
    else
      elem.dataset.active = true
  }

  // Handle the compose being submitted; send an email
  handleCompose() {
    let inputs = document.querySelectorAll(".composeWindow form textarea");
    this.sendMail({
      to: inputs[0].value,
      subject: inputs[1].value,
      body: inputs[2].value,
      from: system.authApp.user.email
    })
    //run through each input and clear it
    for (let i of inputs){
      i.value = ""
    }
  }

  // Send the email
  async sendMail(data) {
    return new Promise((res, rej) => {
      // open a new XML request to custom mail server
      let req = new XMLHttpRequest();
      req.open("POST", "https://SmtpImap-Mail-server.lioliver.repl.co")
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
       // open a new XML request to custom mail server
      let req = new XMLHttpRequest();
      req.open("POST", "https://SmtpImap-Mail-server.lioliver.repl.co")
      req.send(JSON.stringify({
        type: "imap",
        action: "getMail",
        uid: uid,
        accessToken: System.getCookie("oauthToken"),
      }))
      console.log(req, "req")
      // log after finished
      req.onreadystatechange = _ => {
        if (req.readyState === 4)
          res(JSON.parse(req.responseText))
      }
    })
  }
  // function that creates a popup window
  createPopupPanel({
    isPanel = true,
    width = "50vw",
    height = "50vh",
    backgroundColor = "#3c3c3c",
    closable = true,
    content = null
  }) {
    // create main elements
    let popupMain = document.createElement("div");
    let btnCont = document.createElement("div");
    let elem = document.createElement("div");
    document.querySelector(".popupContainer").appendChild(elem);
    if (isPanel)
      elem.classList.add("popupPanel")
    // function to handle when the user clicks the "X" button in popup window
    elem.popupCloseHandler = ()=>{
      popupMain.remove();
    }
    // if a closable popup is created add these elements
    if (closable) {
      let btn = btnCont.appendChild(document.createElement("button"));
      btn.innerText = "X"
      btn.classList.add("closeButton")
      btn.addEventListener("click", elem.popupCloseHandler)
      if (backgroundColor === "#ffffff")
        btn.style.color =  "black";
    }
    // if popup will have content add these elements
    if (content) {
      elem.cont = elem.appendChild(document.createElement("div"))
      elem.cont.innerText = content
      elem.cont.classList.add("popupContent")
      if (backgroundColor === "#ffffff")
        elem.cont.style.color = "black";
    } 
    // set styles for main content elements
    elem.style.width = width;
    elem.style.height = height;
    elem.style.backgroundColor = backgroundColor;
    btnCont.classList.add("popup-close-container")
    // add elements to main popup window
    popupMain.appendChild(btnCont);
    popupMain.appendChild(elem);
    document.querySelector(".popupContainer").appendChild(popupMain);
    // return element to be added to main html
    return elem;
  }

  // Asynchronously retrieves the inbox
  async fetchInbox() {
    return new Promise((res, rej) => {
      // open a new XML request to custom mail server
      let req = new XMLHttpRequest();
      req.open("POST", "https://SmtpImap-Mail-server.lioliver.repl.co")
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
    // bewlow code block clears current mail list to repopulate with new mail items
    let mailContainer = document.querySelector(".mail-list");
    mailContainer.innerHTML = "";
    this.fetchInbox().then(v => {
      console.log(v)
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

  // populates the gui with mail items that has been fetched
  displayInbox(inbox) {
    let mailContainer = document.querySelector(".mail-list");
    mailContainer.innerHTML = "";
    for (let i = inbox.length - 1; i >= 0; i--) {
      mailContainer.appendChild(this.createMailElement({
        subject: inbox[i].subject?.[0],
        author: inbox[i].from?.[0],
        date: inbox[i].date?.[0]?.slice(0, -15),
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
    // populate with data retrieved from each mail content
    let elem = mailItemTemplate.cloneNode(true).content.children[0]
    elem.querySelector(".subject-field").innerText = opts.subject;
    elem.querySelector(".author-field").innerText = opts.author;
    elem.querySelector(".date-field").innerText = opts.date;
    elem.dataset.uid = opts.uid;
    // add click event listener so that the when clicked the user can view current email
    elem.querySelector(".subject-field").parentElement.addEventListener("click", e => {
      this.viewMail(elem.dataset.uid);
    });
    return elem
  }
  // function that creates a popup window to display current selected email contents
  viewMail(uid) {
    let popup = this.createPopupPanel({
      content: " ",
      width: "80vw",
      height: "80vh",
      backgroundColor: "#ffffff"
    })
    this.fetchMailInfo(uid).then(v=>{
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
}
// calculates the size the iframe should be based on content amount
window.resizeIframe = function(iframe) {
  iframe.height = Math.max(iframe.contentWindow.document.body.scrollHeight, 128) + "px";
} 

// call the class mailSystem();
let mailsystem = new MailSystem();


let collapse = document.getElementsByClassName("collapse");
// this is for the collapsible nav item labeled as "More..." on the gui sidepanel
for (let i = 0; i < collapse.length; i++) {
    collapse[i].addEventListener("click", function() {
        let icon = document.querySelector(".more-icon");
        let label = document.querySelector(".collapse-label");
        icon.classList.toggle("active");
        // conditional to change label based on if the collapsible is open or closed
        if (icon.classList.contains("active")) {
          label.innerText = "Less";
        }
        else if (!icon.classList.contains("active")) {
          label.innerText = "More...";
        }
        let content = this.nextElementSibling;
        // changes height depending on collapsible status
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } 
        else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}