var Amqp = require('amqplib/callback_api');

const Rabbit = {
    connection:null,
    queue:null,
    channel:null,
    connect : () => {
        return new Promise((resolve, reject) => {
            Amqp.connect('amqp://ampq', function(error, connection) {
                if (error) {
                    return reject(error);
                }
                Rabbit.connection = connection;
                connection.createConfirmChannel(function(error, channel) {
                    if (error) {
                        return reject(error);
                    }
                    Rabbit.queue = 'wallabag';

                    channel.assertQueue(Rabbit.queue, {
                        durable: false
                    });
                    Rabbit.channel = channel;
                    console.log("Connected to rabbit");
                    resolve();
                });
            });
        });
    },
    
    exportNote : (note) => {
        return new Promise((resolve, reject) => {
            console.log("Try sending " + note.id);
            Rabbit.channel.sendToQueue(Rabbit.queue, Buffer.from(JSON.stringify(note)), { persistent: true }, (error) => {
                if (error) {
                    return reject(error)
                }
                console.log("Sent " + note.id);
                resolve(note)
            });
        });
    },

    findNotesRecursive : (resolve, reject, found) => {
        Rabbit.channel.get(Rabbit.queue, {noAck: true}, function(err, msg) {
            if (msg && found.length<5) {
                found.push(JSON.parse(msg.content.toString()));
                return Rabbit.findNotesRecursive(resolve, reject, found);
            }
            console.log("Found " + found.length + " notes");
            resolve(found);
        });
    },

    findNotes : () => {
        return new Promise((resolve, reject) => {
            Rabbit.findNotesRecursive(resolve, reject, [])
        });
    },

    close : () => {
        console.log("Close rabbit connection" );
        Rabbit.channel.close();
        Rabbit.connection.close();
    }
}

exports.connect = Rabbit.connect.bind(Rabbit);
exports.exportNote = Rabbit.exportNote.bind(Rabbit);
exports.findNotes = Rabbit.findNotes.bind(Rabbit);
exports.close = Rabbit.close.bind(Rabbit);
