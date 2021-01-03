var LeanoteApi = require('leanote_api');

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
