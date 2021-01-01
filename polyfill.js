
Promise.prototype.forEach = function(callback) {
    return this.then(
        valueArray => valueArray.map(value => {
            if (Object.prototype.toString.call(value) == "[object Promise]") {
                return value.then(callback)
            } else {
                return callback(value);
            }
        })
    );
}