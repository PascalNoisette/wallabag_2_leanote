var WallabagApi = require('wallabag_api');
var ClientOAuth2 = require('client-oauth2')

exports.loginToWallabag = (host, clientId, clientSecret, username, password) => {

    var auth = new ClientOAuth2({
        clientId: clientId,
        clientSecret: clientSecret,
        accessTokenUri: host + '/oauth/v2/token'
    })

    let tokenPromise = auth.owner.getToken(username, password);
    tokenPromise.then( 
        (user) => {
            var defaultClient = WallabagApi.ApiClient.instance;
            defaultClient.basePath = host
            // Configure OAuth2 access token for authorization: oAuth
            var oAuth = defaultClient.authentications['oAuth'];
            oAuth.accessToken = user.accessToken
        }
    );
    return tokenPromise;
}



exports.findEntry = () => {
    return new Promise((resolve, reject) => {
        let apiInstance = new WallabagApi.DefaultApi();
        let opts = {
            'detail': "full"
        };
        apiInstance.findNotes(opts, (error, data, response) => {
            if (error) {
                return reject(error);
            } else if (typeof(data.total) == "undefined" || data.total<1) {
                console.log("Found Nothing in Wallagag");
                return resolve([]);
            } else {
                console.log("Found " + data.total + " notes");
                resolve(data._embedded.items);
            }
        });
    })
}

exports.convertToNote = (note) => {
    return new Promise((resolve, reject) => {
        note.UrlTitle = note.url;
        note.content = '<div class="infoToolbar"><p><a href="' + note.url + '" title="Original">Source : ' + note.url  + '</a><br/></p></div>' + note.content;
        return resolve(note);
    });
}

exports.markNoteAsExported = (note) => {
    return new Promise((resolve, reject) => {
        let apiInstance = new WallabagApi.DefaultApi();
        apiInstance.deleteNote(note.id, (error, data, response) => {
            if (error) {
                return reject(error);
            }
            resolve(note);
        });
    });
}
