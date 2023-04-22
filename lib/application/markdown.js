var TurndownService = require('turndown');
var turndownService = new TurndownService();
var fs = require('fs');
var path = require('path');


exports.convert = (note) => {
    return new Promise((resolve, reject) => {
        note.content = turndownService.turndown(note.content ?? note.Content);
        if (!note.title) {
            if (note.Title) {
                note.title = note.Title;
            } else {
                note.title = note.NoteId;
            }
        }
        return resolve(note);
    });
}

exports.saveImage = (outputDirectory, FileId, Title, binary) => {
    if (!Title || Title == "") {
        const mime = "".substr.call(binary, 0, 5).replace(/[^a-zA-Z]/gi, '').substr(0, 3).toLowerCase();
        Title = `${FileId}${mime ? "." + mime : ""}`;
    }
    const dir = `${outputDirectory}/images/${FileId.substr(0,1)}/${FileId.substr(1,2)}`;
    const filename = `${dir}/${Title}`;
    return new Promise((resolve, reject) => {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFile(filename, binary, null, (err) => {
            if (err) {
                reject(err);
            }
            return resolve(filename.replace(outputDirectory, ".."));
        });
    });
}

exports.export = (outputDirectory, node) => {
    return new Promise((resolve, reject) => {
        const markdownFilePath = `${node.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substr(0, 10)}.md`;
        if (typeof(node.preview_picture) != "undefined" && node.preview_picture && node.preview_picture=="NULL") {
            node.preview_picture = `[![](${node.preview_picture})](${node.preview_picture})`; 
        } else {
            node.preview_picture = "";
        }
        if (typeof(node.Tags) == "undefined" || !node.Tags || node.Tags == "null") {
            node.Tags = ["Wallabag"];
        }
        const data = `---
tags: [${node.Tags.join(', ')}]
---
# ${node.title}

Source : ${node.url}
${node.preview_picture}
${node.attachments}

${node.content}
        `; 
        fs.mkdirSync(outputDirectory, { recursive: true });
        fs.writeFile(path.join(outputDirectory,  markdownFilePath[0].toUpperCase() + markdownFilePath.substr(1)), data, null, (err) => {
            if (err) {
                console.log(err);
            }
            return resolve(node);
        });
    });
}

