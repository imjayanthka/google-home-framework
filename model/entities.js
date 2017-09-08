var schema = require("./schema.js");
var _ = require("lodash");



var Entities = function(data){  
    this.sanitize(data);
    return 
}
// let userEntity = {}

Entities.prototype.data = {}
Entities.prototype.sanitize = function (data) {
    data = data || {};
    let userEntity = schema.userEntity;
    this.data = _.pick(_.defaults(data, userEntity), _.keys(userEntity));
    return
}


Entities.prototype.addMCQEntries = function (choices) {
    if (Object.prototype.toString.call(choices) == '[object Array]') {
        let entries = schema.entries
        for(let i = 0; i < choices.length; i ++){
            entries.push({
                value: choices[i],
                synonyms: [choices[i]]
            });
        }
        this.data.entities[0].entries =  entries
        return;
    }
    return;
}

Entities.prototype.getData = function (){
    return this.data;
}

Entities.prototype.saveUserEntities = function (apiai, entity, question) {
    var returnPromise =  new Promise(function(resolve, reject){
        let data = entity.getData()
        console.log(data)
        let user_entities_request = apiai.userEntitiesRequest(data)
        user_entities_request.on("response", (response) => {
            console.log("I am all done");
            resolve(question.title)
        });
        user_entities_request.on('error', function (err) {
            console.log('Error' + err.toString());
            reject(err);
        });
        user_entities_request.end();
    })
    return returnPromise
}


module.exports = Entities;