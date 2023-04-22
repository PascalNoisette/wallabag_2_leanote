require('./lib/helper/polyfill');
var Leanote = require('./lib/application/leanote');
var Markdown = require('./lib/application/markdown');
var Yargs = require('yargs');

const argv = Yargs.command('leanote_2_md', 'Export leanote as markdown file')
    .demandOption(
        ['leanote_host', 'email', 'pwd', 'output'],
        'Please provide all arguments to work with this tool'
    )
    .help()
    .alias('help', 'h')
    .argv;

Leanote.login(argv.leanote_host, argv.email, argv.pwd)
    .then(Leanote.getSyncNotebooks, console.log)
    .forEach(notebook => {
        Leanote.getNotes({notebookId:notebook.NotebookId})
        .stream()
        .pipe(({NoteId}) => Leanote.getNoteAndContent({noteId:NoteId}))
        .pipe(async note=>{
            note.attachments = [];
            await Promise.all(note.Files.map( async ({FileId, IsAttach, Title}) => {
                const binary = await (IsAttach ? Leanote.getAttach({fileId:FileId}):Leanote.getImage({fileId:FileId}));
                const filename = await Markdown.saveImage(argv.output, FileId, Title, binary);
                [
                    argv.leanote_host.replace('/api', '') + '/api/file/getImage?fileId='+FileId,
                    '/api/file/getImage?fileId='+FileId,
                    '/api/file/getAttach?fileId='+FileId
                ].forEach(url=> note.Content = note.Content.replaceAll(url, filename));
                if (IsAttach) {
                    note.attachments.push(`| [${Title}](${filename}) |`);
                }
            }))

            if (note.attachments.length) {
                note.attachments = `| Attachments |\n| ----------- |\n${note.attachments.join('\n')}`;
            } else {
                note.attachments = "";
            }
            
            return note;
        })
        .pipe(Markdown.convert)
        .pipe(note => Markdown.export(argv.output + `${notebook.Title}/`, note))
        .pipe(note => console.log(note.NoteId))
    })
 