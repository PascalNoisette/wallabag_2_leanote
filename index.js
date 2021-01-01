require('./polyfill');
var Wallabag = require('./wallabag');
var Yargs = require('yargs');


const argv = Yargs.command('wallabag_api_extract', 'Pull wallbag notes')
    .demandOption(['host', 'client_id', 'client_secret', 'login', 'password'], 'Please provide all arguments to work with this tool')
    .help()
    .alias('help', 'h')
    .argv;

Wallabag.loginToWallabag(argv.host, argv.client_id, argv.client_secret, argv.login, argv.password)
    .then(Wallabag.findNotes)
    .forEach(Wallabag.exportNote)
    .forEach(Wallabag.markNoteAsExported);