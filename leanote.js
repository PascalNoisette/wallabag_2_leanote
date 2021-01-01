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
                console.log(data.Token);
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
        let apiInstance = new LeanoteApi.DefaultApi();
        apiInstance.getSyncNotebooks({}, (error, notebooks, response) => {
            if (error) {
              reject(error);
            }
            notebooks = notebooks.filter(notebook=>notebook.Title==title);
            if (notebooks.length<1) {
              reject(title + " not found");
            }
            console.log("Import into notebook " + notebooks[0].Title)
            return resolve(notes.map(note=>note.notebook_id = notebooks[0].notebookId));
        });
    });
}

exports.importNote = (notes) => {
    //TODO
    console.log('TODO import :');
    console.log(notes);
}
