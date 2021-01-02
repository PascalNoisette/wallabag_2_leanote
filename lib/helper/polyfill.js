
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