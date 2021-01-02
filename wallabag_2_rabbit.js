require('./lib/helper/polyfill');
var Wallabag = require('./lib/application/wallabag');
var Rabbit = require('./lib/application/rabbit');
var Yargs = require('yargs');

const argv = Yargs.command('wallabag_2_rabbit', 'Pull wallbag notes')
    .demandOption(['host', 'client_id', 'client_secret', 'login', 'password'], 'Please provide all arguments to work with this tool')
    .help()
    .alias('help', 'h')
    .argv;

Wallabag.loginToWallabag(argv.host, argv.client_id, argv.client_secret, argv.login, argv.password)
    .then(Rabbit.connect)
    .then(Wallabag.findNotes)
    .forEach(Rabbit.exportNote)
    .forEach(Wallabag.markNoteAsExported)
    .all(Rabbit.close);