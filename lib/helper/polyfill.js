var stream = require('stream');

Promise.prototype.forEach = function(callback) {
    return this.then(
        valueArray => {
            valueArray.forEach((value, index) => {
                if (Object.prototype.toString.call(value) == "[object Promise]") {
                    valueArray[index]=value.then(callback);
                } else {
                    valueArray[index]=callback(value);
                }
            });
            return valueArray;
        }
    );
}

Promise.prototype.all = function(callback) {
    return this.then(
        valueArray => {
            return Promise.all(valueArray).then(()=>callback(valueArray))
        }
    );
}


Promise.prototype.stream = function() {
    const readPipeline = new stream.Readable({objectMode: true});
    readPipeline._read = ()=>{};
    this.then(
        valueArray => {
            valueArray.forEach(item => readPipeline.push(item))
            readPipeline.push(null)
        }
    );
    return Promise.resolve(readPipeline);
}


Promise.prototype.pipe = function(mycallback) {
    const transformPipeline = new stream.Transform({objectMode: true})
    transformPipeline._transform = (object, encoding, done) => {
        const value = mycallback(object);
        const next = (res) => {
            done(null, res);
        }
        if (Object.prototype.toString.call(value) == "[object Promise]") {
            value.then(next);
        } else {
            next(value);
        }
    }
    this.then(
        readPipeline => {
            readPipeline.pipe(transformPipeline)
        }
    );
    return Promise.resolve(transformPipeline);
}
