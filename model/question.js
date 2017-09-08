var Entities = require("./entities");
var schema = require("./schema");
var _ = require("lodash");
var Quesiton = function (data){
    this.data = this.sanitize(data);
}

Quesiton.prototype.data = {}

Question.prototype.sanitize= function (data){
    data = data || {}
    //Should create Schema of data required
    let quesitonData = schema.questionData
    return _.pick(_.defaults(data, quesitonData), _.keys(quesitonData));
}


Question.prototype.getData = function (question){
    return this.data;
}

Question.prototype.setData = function(data){
    this.data = data;
    return
}

Quesiton.prototype.next = function(question){
    //This is great thing
    
    switch(context){
        case "next":
            break;
        case "back":
            break;
        case "skip":
            break;
        default:
            break;
    }
}

Question.prototype.skip = function(quesiton){

}

Quesiton.prototype.back = function(quesiton){

}

Quesiton.prototype.repeat = function(quesiton){
    nextQuestion(question, "done")
        .then(function (toTell) {
            console.log('To tell: ' + toTell)
            assistant.tell(toTell)
        })
        .catch(function (error) {
            console.log(error)
            assistant.tell("Something went wrong")
        })
}

Quesiton.prototype.done = function(quesiton){

}

Quesiton.prototype.returnTitle = function(question){
    if (question != undefined) {
        //Give the next question and also setups anything required for the session.
        switch (question.type) {
            case "MultipleChoice":
                //Need to update entities
                // Create a new promise
                console.log("current session: " + question.sessionId)
                var data = new Entities({ sessionId: currentSession.sessionId });
                data.addMCQEntries(question.choices)
                return data.saveUserEntities(appli, data, question);
                break;
            case "Scale":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            case "textSlide":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            case "timeInt":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            case "dateTime":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            case "textField":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            case "yesNo":
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                })
                break;
            default:
                return new Promise(function (resolve, reject) {
                    resolve(question.title)
                });
        }
    } else {
        return new Promise(function (resolve, reject) {
            resolve("Thank You for participating in the survey")
        })
    }


}




function nextQuestion(currentSession, appli, context) {
    var question;
    if (context == "next") {
        question = easy.shift()
        currentSession.currentQuestion = question;
    } else {
        question = currentSession.currentQuestion;
    }
    
}


module.exports = Quesiton;