var LeanoteApi = require('leanote_api');


Object.getOwnPropertyNames(LeanoteApi.DefaultApi.prototype)
    .filter(prop => prop != "constructor")
    .forEach(fct => {

    exports[fct] = (opt) => {
        return new Promise((resolve, reject) => {
            let apiInstance = new LeanoteApi.DefaultApi();
            apiInstance[fct](opt, (error, res, response) => {
                if (error) {
                    return reject(error);
                }
                resolve(res);
            });
        });
    }
});


exports.login = (host, email, pwd) => {
    return new Promise((resolve, reject) => {
        var defaultClient = LeanoteApi.ApiClient.instance;
        defaultClient.basePath = host
        let apiInstance = new LeanoteApi.DefaultApi();
        apiInstance.login(email, pwd, (error, data, response) => {
            if (error) {
                return reject(error);
            } else {
                console.log("Connected to " + host);
                // Configure API key authorization: ApiKeyAuth
                let ApiKeyAuth = defaultClient.authentications['ApiKeyAuth'];
                ApiKeyAuth.apiKey = data.Token;
                return resolve();
            }
        });
    })
}

exports.assignNotebook = (title, notes) => {
    return new Promise((resolve, reject) => {
        if (notes.length<1) {
            return resolve(notes);
        }

        let apiInstance = new LeanoteApi.DefaultApi();
        apiInstance.getSyncNotebooks({}, (error, notebooks, response) => {
            if (error) {
               return reject(error);
            }
            notebooks = notebooks.filter(notebook=>notebook.Title==title);
            if (notebooks.length<1) {
               return reject(title + " not found");
            }
            console.log("Import into notebook '" + notebooks[0].Title + "'")
            notes.map(note => note.notebookId = notebooks[0].NotebookId);
            resolve(notes);
        });
    });
}

exports.importNote = (note) => {
    return new Promise((resolve, reject) => {
        var defaultClient = LeanoteApi.ApiClient.instance;
        defaultClient.plugins = [function (request) {
            if (note.mail && note.mail.attachments)
                console.log("Plugin attach " + note.mail.attachments.length);
            if (note.mail && note.mail.attachments && note.mail.attachments.length>0) {
                note.mail.attachments.forEach(attachment => {
                    request.field('Files['+attachment.filename+'][FileId]', attachment.filename);
                    request.field('Files['+attachment.filename+'][LocalFileId]', attachment.filename);
                    request.field('Files['+attachment.filename+'][Title]', attachment.filename);
                    request.field('Files['+attachment.filename+'][Type]', attachment.contentType);
                    request.field('Files['+attachment.filename+'][HasBody]', attachment.filename);
                    request.field('Files['+attachment.filename+'][IsAttach]', attachment.filename);
                    request.attach('FileDatas['+attachment.filename+']', attachment.content, {"filename":attachment.filename, "contentType":attachment.contentType});
                });
            }
    
            return request;
        }];
        let apiInstance = new LeanoteApi.DefaultApi();
        apiInstance.addNote(note, (error, data, response) => {
            if (error) {
                return reject(error);
            }
            if (data.Ok == 'false') {
                return reject(data.Msg)
            }
            console.log('Imported ' + note.title + ' successfully');
            console.log(data);
            resolve(note);
        });
    });
}
