require('./lib/helper/polyfill');
var Leanote = require('./lib/application/leanote');
var Email = require('./lib/application/email');
var Yargs = require('yargs');

const argv = Yargs.command('email_2_leanote', 'Push notes to leanote')
    .demandOption(
        ['host', 'port', 'user', 'password', 'tls', 'leanote_host', 'email', 'pwd', 'notebook'],
        'Please provide all arguments to work with this tool'
    )
    .help()
    .alias('help', 'h')
    .argv;

Leanote.login(argv.leanote_host, argv.email, argv.pwd)
    .then(()=>Email.connect({imap: argv}))
    .then(Email.openInbox)
    .then(Email.searchUnread)
    .then(messages => Leanote.assignNotebook(argv.notebook, messages))
    .forEach(Email.parse)
    .forEach(Email.convertToNote)
    .forEach(Leanote.importNote)
    .forEach(Email.markNoteAsExported)
    .all(Email.close);
