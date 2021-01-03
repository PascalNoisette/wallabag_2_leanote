var imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');

exports.connect = (opt) => {
    return imaps.connect(opt);
}
exports.openInbox = (connection) => {
    return connection.openBox('INBOX').then(() => connection);
}
exports.searchUnread = (connection) => {
    var searchCriteria = ['UNSEEN'];
    var fetchOptions = { bodies: ['HEADER', 'TEXT', ''], struct: true };

    return connection.search(searchCriteria, fetchOptions).then(
        (result) => {
            result.connection = connection; return result;
        }
    );
}
exports.parse = (message) => {
    var all = _.find(message.parts, { "which": "" })
    var id = message.attributes.uid;
    var idHeader = "Imap-Id: "+id+"\r\n";
    return simpleParser(idHeader+all.body).then(
        (mail) => {
            message.mail = mail;
            return message;
        }
    );
}
exports.convertToNote = (message) => {
    return new Promise((resolve, reject) => {
        message.title = message.mail.subject;
        message.content = message.mail.text;
        if (message.mail.html && message.mail.html.length>0) {
            message.content = message.mail.html;
        }
        resolve(message);
    });
}
exports.markNoteAsExported = (message) => {
    console.log("markNoteAsExported DISABLED")
    return new Promise((resolve, reject) => {resolve(message)});//openConnection.addFlags(message.attributes.uid, "\Seen");
}
exports.close = (data) => {
    data.connection.imap.closeBox(true, (err) => { //Pass in false to avoid delete-flagged messages being removed
        if (err) {
            console.log(err);
        }
    });
    data.connection.end();
}