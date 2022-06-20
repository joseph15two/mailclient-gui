const Imap = require("imap"),
  inspect = require("util").inspect

//const Oauth = require("openid-client")

const fs = require('fs')

//import {issuer} from 'openid-client'

class userInstance {
  constructor(userName, password, validator) {
    this.IMAP = new Imap({
      user: userName,
      password: password,
      host: "imap.gmail.com", //replace with server connection
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });
    this.certificate = validator
  }

  openInbox(cb) {
    //open a specific (in this case, 'INBOX') mailbox
    this.IMAP.openBox('INBOX', true, cb);
  }

  //checkMailbox function
  checkInbox() {
    this.IMAP.search('UNSEEN', ['SINCE', 'June 8th, 2022'], function(err, results) {
      //make sure the connection happened
      if (err) throw err;
      //make an empty container for message contents
      let textBodies = this.IMAP.fetch(results, { bodies: '' })
      textBodies.on('message', function(msg, seqno) {
        //log how many messages arrived before the current one
        console.log('Message #%d', seqno);
        //store how many messages arrived before the current one
        let prefix = '(#' + seqno + ') ';
        //add a listener for the message contents 
        msg.on('body', function(stream) {
          console.log(prefix + 'body')
          stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
        });
        //when a message is recieved, log the attributes
        msg.once('attributes', function(attrs) {
          console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8))
        });
        //wait until finished grabbing attributes
        msg.once('end', function() {
          //and log them to the console
          console.log(prefix + 'Finished');
        });
      });
      this.finishedProperly(this.textBodies, this.IMAP)
    })
    console.log(textBodies)
  }

  //console notif
  finishProperly(runningProcess, container) {
    //check for connection issues
    runningProcess.once('error', function(err) {
      //and log them to the console
      console.log('Fetch error: ' + err);
    });
    //wait until the data stream is finished
    runningProcess.once('end', function() {
      //log that it is to the console
      console.log('Done fetching all messages!');
      //and stop listening for new information
      container.end();
    });
  }

}

export { userInstance }