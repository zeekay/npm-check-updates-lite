var Promise = require('bluebird')

/**
 * For some reason, Promise.promisifyAll does not work on npm.commands :(
 *   Promise.promisifyAll(npm.commands);
 * So we have to do it manually.
 */
function rawPromisify(obj) {
    // These commands are broken in npm 5, so we cannot wrap them
    var missing = {
        'cit': false,
        'sit': false,
    }

    function addAsync(obj, name) {
        var method = obj[name]

        obj[name + 'Async'] = function() {
            var args = [].slice.call(arguments)
            var that = this
            return new Promise(function(resolve, reject) {
                args.push(function(err, results) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results)
                    }
                })
                return method.apply(that, args)
            })
        }
    }

    for (var name in obj) {
        if (name in missing) continue
        addAsync(obj, name)
    }
}

module.exports = rawPromisify
