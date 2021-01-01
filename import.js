require('./polyfill');
var Leanote = require('./leanote');
var Rabbit = require('./rabbit');
var Yargs = require('yargs');

const argv = Yargs.command('leanote_api_import', 'Push notes to leanote')
    .demandOption(['host', 'email', 'pwd', 'notebook'], 'Please provide all arguments to work with this tool')
    .help()
    .alias('help', 'h')
    .argv;

Leanote.login(argv.host, argv.email, argv.pwd)
    .then(Rabbit.connect)
    .then(Rabbit.findNotes)
    .then(notes => Leanote.assignNotebook(argv.notebook, notes))
    .forEach(Leanote.importNote)
    .all(Rabbit.ack);