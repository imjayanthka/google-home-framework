// server.js
// where your node app starts

//Frameworks
const express = require('express');
const request = require('request');
const session = require('express-session')
const Map = require('es6-map');
const prettyjson = require('prettyjson');
const toSentence = require('underscore.string/toSentence');

//Google and API.AI
const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
// const apiai = require("apiai"); 
const bodyParser = require('body-parser');

//Models
const Entities = require("./model/entities.js");
const Question = require("./model/question")

// init project
const app = express();
//c7d8de5955a74ef7897a5f729382a378
// const appli = apiai("c7d8de5955a74ef7897a5f729382a378");

const survey = [{
    "conditionID": "",
    "id": "yesno1",
    "on": "",
    "subtitle": "",
    "title": "Yes no 1",
    "type": "yesNo"
}, {
    "id": "text1",
    "subtitle": "",
    "title": "Text 1",
    "type": "textField"
}, {
    "choices": ["yellow", "red", "blue"],
    "conditionID": "",
    "id": "mcq",
    "multipleSelect": false,
    "on": "",
    "subtitle": "fav",
    "title": "fav",
    "type": "MultipleChoice"
}, {
    "conditionID": "",
    "id": "q1",
    "on": "",
    "subtitle": "",
    "title": "Intro Slide",
    "type": "textSlide"
}, {
    "both": true,
    "id": "q2",
    "multiple": false,
    "prior": false,
    "subtitle": "",
    "title": "What is the star date",
    "type": "dateTime"
}, {
    "conditionID": "",
    "id": "q5",
    "on": "",
    "subtitle": "",
    "title": "Time int",
    "type": "timeInt"
}, {
    "conditionID": "",
    "id": "asdfa",
    "multipleSelect": "",
    "on": "",
    "subtitle": "",
    "title": "Range me",
    "type": "Scale"
}]

const easy = [{
    "conditionID": "",
    "id": "yesno1",
    "on": "",
    "subtitle": "",
    "title": "Yes no 1",
    "type": "yesNo"
}, {
    "conditionID": "",
    "id": "q5",
    "on": "",
    "subtitle": "",
    "title": "Time int",
    "type": "timeInt"
}, {
    "choices": ["yellow", "red", "blue"],
    "conditionID": "",
    "id": "mcq",
    "multipleSelect": false,
    "on": "",
    "subtitle": "fav",
    "title": "fav",
    "type": "MultipleChoice"
}]


app.use(bodyParser.json({ type: 'application/json' }));

// This boilerplate uses Express, but feel free to use whatever libs or frameworks
// you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// Initialize the session for the user.
app.use(session({secret: "shhhshshhssh"}))
var currentSession;
var question;


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

// Handle webhook requests
app.post('/', function (req, res, next) {
    currentSession = req.session;
    // Log the request headers and body, to aide in debugging. You'll be able to view the
    // webhook requests coming from API.AI by clicking the Logs button the sidebar.
    // logObject('Request headers: ', req.headers);
    // logObject('Request body: ', req.body);
    console.log("Session id in session: "+currentSession.sessionId)
    console.log("Session id from api.ai: "+req.body.sessionId)
   
    // Checking for session error.
    if(!currentSession.sessionId){
        if(currentSession.sessionId != req.body.sessionId){
            currentSession.sessionId = req.body.sessionId
        }
    }
    console.log("Session id in session: "+currentSession.sessionId)
    // Instantiate a new API.AI assistant object.
    const assistant = new ApiAiAssistant({ request: req, response: res });

    // Declare constants for your action and parameter names
    const YES_NO_ANSWER = 'everything.action' // The action name from the API.AI intent
    const WELCOME_INTENT = 'input.welcome'



    const YES_NO_RESPONSE = 'yesNoResponse' // An API.ai parameter name
    const MCQ_RESPONSE = 'mcq-entity'
    const TIME_INTERVAL = 'timeInterval'

    function nextQuestion(currentSession, appli, context) {
        var question;
        if(context == "next"){
           question = easy.shift()
            currentSession.currentQuestion  = question;
        } else {
            question = currentSession.currentQuestion;
        }
        if(question != undefined){
            //Give the next question and also setups anything required for the session.
            switch (question.type) {
                case "MultipleChoice":
                    //Need to update entities
                    // Create a new promise
                    console.log("current session: " + currentSession.sessionId)
                    var data = new Entities({sessionId: currentSession.sessionId});
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

    function getUserEntities(sessionId, queryString){
        var entities = new Promise(function (resolve, reject) {
            var options = {
                sessionId: req.body.sessionId
            };
            var requestEntity = appli.textRequest(queryString, options);
            requestEntity.on('response', (response) => function (response) {
                resolve(response)
            })
            requestEntity.on('error', (err) => function (err) {
                reject(err)
            })
            requestEntity.end();
        }) 
        return entities 
    }

    function deleteUserEntities(sessionId){
    }






    // Create functions to handle intents here
    function yesNoAnswer(assistant) {
        console.log('Handling action: ' + YES_NO_ANSWER);
        let yesNoAnswer = assistant.getArgument(YES_NO_RESPONSE);
        let mcqAnswer = assistant.getArgument(MCQ_RESPONSE);
        let timeInterval = assistant.getArgument(TIME_INTERVAL);

        console.log('ID' + req.body.sessionId)
        console.log('yesNoAnswer' + yesNoAnswer)
        console.log('mcqAnswer'+ mcqAnswer)
        console.log('timeInterval'+ timeInterval)
        console.log('*****************************************')
        
        switch(mcqAnswer){
            case "Repeat":
                question.repeatQuestion
                    .then(function (toTell) {
                        console.log('To tell: Repeat: ' + toTell)
                        assistant.tell(toTell)
                    })
                    .catch(function (err) {
                        console.log(err)
                        assistant.tell("Something went wrong")
                    })
                break;
            case "Back":
                // I need to index for get which question in array.
                question.backQuestion()
                    .then(function (toTell) {
                        console.log('To tell: Back: ' + toTell)
                        assistant.tell(toTell)
                    })
                    .catch(function (error) {
                        console.log(error)
                        assistant.tell("Something went wrong")
                    })
                break;
            case "Skip":
                question.skipQuestion()
                    .then(function (toTell) {
                        console.log('To tell: Skip: ' + toTell)
                        assistant.tell(toTell)
                    })
                    .catch(function (error) {
                        console.log(error)
                        assistant.tell("Something went wrong")
                    })
                break;
            case "Done":
                question.doneQuestion(currentSession, appli, "done")
                    .then(function (toTell) {
                        console.log('To tell: Done: ' + toTell)
                        assistant.tell(toTell)
                    })
                    .catch(function (error) {
                        console.log(error)
                        assistant.tell("Something went wrong")
                    })
                
                break;
            default:
                question.nextQuestion()
                    .then(function (toTell) {
                        console.log('To tell: default: ' + toTell)
                        currentSession = question.getData("currentSession")
                        assistant.tell(toTell)
                    })
                    .catch(function (error) {
                        console.log(error)
                        assistant.tell("Something went wrong")
                    })
                break;
        }
        // question.nextQuestion()
        //     .then(function (toTell) {
        //         currentSession = question.getData("currentSession")
        //         assistant.tell(toTell)
        //     })
        //     .catch(function (error) {
        //         console.log(error)
        //         assistant.tell("Something went wrong")
        //     })
        //Based on the answer
        // if(mcqAnswer == "repeat"){
        //     nextQuestion(currentSession, appli, "repeat")
        //     .then(function(toTell){
        //         console.log('To tell: ' + toTell)
        //         assistant.tell(toTell)
        //     })
        //     .catch(function(err){
        //         console.log(err)
        //         assistant.tell("Something went wrong")
        //     })                          
        // } else {
        //     //Next question string
        //     nextQuestion(currentSession, appli, "next")
        //     .then(function(toTell){
        //         console.log('To tell: ' + toTell)
        //         assistant.tell(toTell)
        //     })
        //     .catch(function(error){
        //         console.log(error)
        //         assistant.tell("Something went wrong")
        //     })
        // }
        
    }

    function welcomeIntent(assistant){
        console.log('Handling Action: Welcome Intent')
        //Define session variables
        currentSession.currentIndex = 0;
        currentSession.prevIndex = null;
        //Create new question object
        question = new Question({currentSession: currentSession, survey: easy})

        //Need to return session
        question.firstQuestion()
            .then(function (toTell){
                currentSession = question.getData("currentSession")
                assistant.tell(toTell)
            })
            .catch(function (err){
                console.log(err)
                assistant.tell("Hey something went wrong.")
            })
    }


    // Add handler functions to the action router.
    let actionRouter = new Map();

    // Mapping Intents to Functions.
    actionRouter.set(YES_NO_ANSWER, yesNoAnswer);
    actionRouter.set(WELCOME_INTENT, welcomeIntent);

    // Route requests to the proper handler functions via the action router.
    assistant.handleRequest(actionRouter);
});

// Handle errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// Pretty print objects for logging.
function logObject(message, object, options) {
    console.log(message);
    console.log(prettyjson.render(object, options));
}

// Listen for requests.
let server = app.listen(9100, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

