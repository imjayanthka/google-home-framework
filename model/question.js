const apiai = require("apiai"); 

const appli = apiai("c7d8de5955a74ef7897a5f729382a378");
var Entities = require("./entities");
var schema = require("./schema");
var _ = require("lodash");





var Question = function (data){
    this.data = this.sanitize(data);
    console.log(this.data)
    this.numberOfQuestions = this.data.survey.length;
    this.data.question  = this.data.survey[this.data.currentSession.currentIndex]
}

Question.prototype.data = {};
Question.prototype.numberOfQuestions = null;


Question.prototype.sanitize= function (data){
    data = data || {}
    //Should create Schema of data required
    let quesitonData = schema.questionData
    return _.pick(_.defaults(data, quesitonData), _.keys(quesitonData));
}


Question.prototype.getData = function (attribute){
    if(attribute == null)
        return this.data;
    else
        return this.data[attribute]
}

Question.prototype.setData = function(data){
    this.data = data;
    return
}

Question.prototype.firstQuestion = function(){
    this.data.question = this.data.survey[this.data.currentSession.currentIndex]
    return this.returnTitle()
}

Question.prototype.nextQuestion = function(){
    //Change in session information
    this.data.currentSession.prevIndex = this.data.currentSession.currentIndex;
    this.data.currentSession.currentIndex++;
    this.data.question = this.data.survey[this.data.currentSession.currentIndex]
    //Return the Promise
    return this.returnTitle()   
}

Question.prototype.skipQuestion = function(quesiton){
    return this.next();
}

Question.prototype.backQuestion = function(quesiton){
    this.data.currentSession.currentIndex = this.data.currentSession.prevIndex;
    this.data.currentSession.prevIndex--;
    this.data.quesiton = this.data.survey[this.data.currentSession.currentIndex]
    //return promise
    return this.returnTitle()
}

Question.prototype.repeatQuestion = function(){
    //No change in session information
    return this.returnTitle()
}


//For multiple select options.
Question.prototype.doneQuestion = function(quesiton){
    //Save the MCQ response as the 
    return this.returnTitle()
}

Question.prototype.returnTitle = function(){
    if (this.data != undefined) {
        let questionData = this.getData(null);
        console.log(this.getData())
        //Give the next question and also setups anything required for the session.
        switch (questionData.question.type) {
            case "MultipleChoice":
                //Need to update entities
                // Create a new promise
                console.log("current session: " + questionData.currentSession.sessionId)
                var data = new Entities({ sessionId: questionData.currentSession.sessionId });
                data.addMCQEntries(questionData.question.choices)
                //returns a promise
                return data.saveUserEntities(appli, data, questionData.question);
                break;
            case "Scale":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            case "textSlide":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            case "timeInt":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            case "dateTime":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            case "textField":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            case "yesNo":
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                })
                break;
            default:
                return new Promise(function (resolve, reject) {
                    resolve(questionData.question.title)
                });
                break;
        }
    } else {
        return new Promise(function (resolve, reject) {
            resolve("Thank You for participating in the survey")
        })
    }


}

module.exports = Question;