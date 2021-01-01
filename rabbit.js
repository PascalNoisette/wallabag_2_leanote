var Amqp = require('amqplib/callback_api');

const Rabbit = {
    connection:null,
    queue:null,
    channel:null,
    connect : () => {
        return new Promise((resolve, reject) => {
            Amqp.connect('amqp://ampq', function(error, connection) {
                if (error) {
                    reject(error);
                }
                Rabbit.connection = connection;
                connection.createConfirmChannel(function(error, channel) {
                    if (error) {
                        reject(error);
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
                    console.error(error);
                    reject(error)
                }
                console.log("Sent " + note.id);
                resolve(note)
            });
        });
    },


    close : () => {
        console.log("Close " );
        Rabbit.channel.close();
        Rabbit.connection.close();
    }
}

exports.connect = Rabbit.connect.bind(Rabbit);
exports.exportNote = Rabbit.exportNote.bind(Rabbit);
exports.close = Rabbit.close.bind(Rabbit);
