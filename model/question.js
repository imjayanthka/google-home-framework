var Entities = require("./entities");
var schema = require("./schema");
var _ = require("lodash");





var Question = function (data){
    this.data = this.sanitize(data);
    // console.log(this.data)
    this.numberOfQuestions = this.data.survey.length;
    this.data.question  = this.data.survey[this.data.currentSession.currentIndex]
}

Question.prototype.data = {};
Question.prototype.numberOfQuestions = null;


Question.prototype.sanitize= function (data){
    data = data || {}
    //Should create Schema of data required
    let questionData = schema.questionData
    return _.pick(_.defaults(data, questionData), _.keys(questionData));
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

Question.prototype.firstQuestion = function(obj){
    let entity = new Entities({ sessionId: this.data.currentSession.sessionId })
    var returnValue = new Promise(function(resolve, reject){
        // console.log("Promise Started")
        entity.setupNavigationEntity()
            .then(function (response) {
                // console.log(obj.data.question)
                console.log('****************')
                obj.data.question = obj.data.survey[obj.data.currentSession.currentIndex]
                resolve(obj.returnTitle())
            })
            .catch(function (error) {
                reject(error)
            })
    })
    return returnValue
}

Question.prototype.nextQuestion = function(){
    console.log("Next")
    // console.log(this.data.currentSession)
    //Change in session information
    if(this.data.currentSession.currentIndex >= (this.numberOfQuestions -  1)){
        return new Promise(function(resolve, reject){
            resolve("You reached the end of the survey")
        })
    }
    this.data.currentSession.prevIndex = this.data.currentSession.currentIndex;
    this.data.currentSession.currentIndex++;
    this.data.question = this.data.survey[this.data.currentSession.currentIndex]
    //Return the Promise
    return this.returnTitle()   
}

Question.prototype.skipQuestion = function(){
    console.log("Skip")
    return this.nextQuestion();
}

Question.prototype.backQuestion = function(){
    console.log("Back")
    if (this.data.currentSession.prevIndex <= 0) {
        return new Promise(function (resolve, reject) {
            resolve("You can't go back on the first question")
        })
    }
    this.data.currentSession.currentIndex = this.data.currentSession.prevIndex;
    this.data.currentSession.prevIndex--;
    this.data.question = this.data.survey[this.data.currentSession.currentIndex]
    console.log(this.data)
    //return promise
    return this.returnTitle()
}

Question.prototype.repeatQuestion = function(options){
    //No change in session information
    console.log("Repeat")
    return this.returnTitle(options)
}


//For multiple select options.
Question.prototype.doneQuestion = function(){
    //Save the MCQ response as the 
    console.log("Done")
    return this.returnTitle()
}

Question.prototype.returnTitle = function(options){
    if (this.data != undefined) {
        let questionData = this.getData(null);
        // console.log(this.getData())
        //Give the next question and also setups anything required for the session.
        switch (questionData.question.type) {
            case "MultipleChoice":
                //Need to update entities
                // Create a new promise
                // console.log("current session: " + questionData.currentSession.sessionId)
                var data = new Entities({ sessionId: questionData.currentSession.sessionId });
                console.log('Choices: ' + questionData.question.choices)
                data.addMCQEntries(questionData.question.choices)
                //returns a promise
                return data.saveUserEntities(questionData.question);
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
                // console.log('Time int')
                return new Promise(function (resolve, reject) {
                    // console.log(options)
                    let toTell = ""
                    if (options === "NO_EXPECTED_RESPONSE"){
                        // console.log('Inside the if')
                        toTell = "Sorry your answer doesn't match the required answer. Your question was, "+ questionData.question.title;
                    } else {
                        toTell = questionData.question.title   
                    }
                    resolve(toTell)
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


Question.prototype.navigation = function(responses){
    // console.log(responses)
    switch (responses.mcqAnswer ? responses.mcqAnswer.toUpperCase() : ""){
        case "NEXT":
            return this.nextQuestion();
        case "REPEAT":
            return this.repeatQuestion();
            break;
        case "BACK":
            // I need to index for get which question in array.
            return this.backQuestion();
            break;
        case "SKIP":
            return this.skipQuestion()
            break;
        case "DONE":
            return this.doneQuestion()
            break;
        default:
            return this.validateResponse(responses)
            break;
    }
}


//Function should return a promise to function properly
Question.prototype.validateResponse = function(responses){
    console.log("validating responses")
    let qtype = this.data.question.type;
    let qid = this.data.question.id;
    switch(qtype){
        case "YesNo": 
            if(responses.yesNoAnswer){
                this.data.responses[qid] = responses.yesNoAnswer
            } else {
                return this.repeatQuestion("NO_EXPECTED_RESPONSE")
            }
            return this.nextQuestion()
            break;
        case "MultipleChoice":
            // if(response.mcqResponse != null){
               
            // } else {

            // }
            return this.nextQuestion()
            break;
        case "dateTime":
            if (!responses.dateResponse || !responses.timeResponse){
                if(!responses.dateResponse){

                    if(!responses.timeResponse){

                    }
                } else {
                    //Available Date Response.
                }
                if(!responses.timeResponse){

                    if(!responses.dateResponse){
                        
                    }
                }
            } else {
                //When both are avialable.
                // Check the question requriement.
            }
            return this.nextQuestion()
            break;
        case "timeInt":
            if (responses.timeInterval){
                // console.log(responses.timeInterval)
                //amount and unit
                this.data.responses[qid] = responses.timeInterval
                return this.nextQuestion()
            } else {
                // console.log("Repeating Time Interval question")
                //Need to repeat the question if didnt get the response
                return this.repeatQuestion("NO_EXPECTED_RESPONSE")
            }
            break;
        case "Scale":
            if(responses.scaleResponse){
                this.data.responses[qid] = responses.timeInterval
                return this.nextQuestion()
            } else {
                console.log("Repeating Scale Question")
                return this.repeatQuestion("NO_EXPECTED_RESPONSE")
            }
            return this.nextQuestion()
            break;
        case "textField":
            return this.nextQuestion()
            break;
        case "textSlide":
            return this.nextQuestion()
            break;
        default:
            return this.nextQuestion()
            break;
    }
}

module.exports = Question;