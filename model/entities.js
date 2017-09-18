const apiai = require("apiai");

const appli = apiai("c7d8de5955a74ef7897a5f729382a378");
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
    console.log(this.data.entities[0])
    return;
}

Entities.prototype.getData = function (){
    return this.data;
}

Entities.prototype.saveUserEntities = function (question) {
    let data = this.getData()
    var returnPromise =  new Promise(function(resolve, reject){
        // console.log(data)
        let user_entities_request = appli.userEntitiesRequest(data)
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


Entities.prototype.setupNavigationEntity = function(){
    var data = this.getData()
   var returnPromise = new Promise(function(resolve, reject){
       data.entities[0].entries = schema.entries
    //    console.log("#############")
    //    console.log(data)
       let user_entities_request = appli.userEntitiesRequest(data)
       user_entities_request.on("response", (response) => {
           console.log("Setup navigation entities")
           resolve("sucess")
       })
       user_entities_request.on("error", (err) => {
           console.log('Error: '+ err.toString())
           reject("Error")
       })
       user_entities_request.end()
   }) 
   return returnPromise;
}



module.exports = Entities;