require('./lib/helper/polyfill');
var Markdown = require('./lib/application/markdown');
var Wallabag = require('./lib/application/wallabag');
var Yargs = require('yargs');

const argv = Yargs.command('wallabag_2_md', 'Export wallabag entries as markdown')
    .demandOption(
        ['wallabag_host', 'client_id', 'client_secret', 'login', 'password', 'output'],
        'Please provide all arguments to work with this tool'
    )
    .help()
    .alias('help', 'h')
    .argv;

Wallabag.loginToWallabag(argv.wallabag_host, argv.client_id, argv.client_secret, argv.login, argv.password)
    .then(Wallabag.findEntry)
    .forEach(Markdown.convert)
    .forEach((note) => Markdown.export(argv.output, note))
    .forEach(Wallabag.markNoteAsExported);
