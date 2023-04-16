var TurndownService = require('turndown');
var turndownService = new TurndownService();
var fs = require('fs');
var path = require('path');


exports.convert = (note) => {
    return new Promise((resolve, reject) => {
        note.content = turndownService.turndown(note.content);
        console.log(note);
        return resolve(note);
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
        const data = `---
tags: [Wallabag]
---
# ${node.title}
Source : ${node.url}
${node.preview_picture}
${node.content}
        `; 
        fs.writeFile(path.join(outputDirectory,  markdownFilePath[0].toUpperCase() + markdownFilePath.substr(1)), data, null, (err) => {
            if (err) {
                console.log(err);
            }
            return resolve(node);
        });
    });
}

