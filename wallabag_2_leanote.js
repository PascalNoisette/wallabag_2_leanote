require('./lib/helper/polyfill');
var Leanote = require('./lib/application/leanote');
var Wallabag = require('./lib/application/wallabag');
var Yargs = require('yargs');

const argv = Yargs.command('wallabag_2_leanote', 'Push notes to leanote')
    .demandOption(
        ['wallabag_host', 'client_id', 'client_secret', 'login', 'password', 'leanote_host', 'email', 'pwd', 'notebook'],
        'Please provide all arguments to work with this tool'
    )
    .help()
    .alias('help', 'h')
    .argv;

Wallabag.loginToWallabag(argv.wallabag_host, argv.client_id, argv.client_secret, argv.login, argv.password)
    .then(()=>Leanote.login(argv.leanote_host, argv.email, argv.pwd))
    .then(Wallabag.findNotes)
    .then(notes => Leanote.assignNotebook(argv.notebook, notes))
    .forEach(Leanote.importNote)
    .forEach(Wallabag.markNoteAsExported);
