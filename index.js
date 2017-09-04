// server.js
// where your node app starts

// init project
const express = require('express');
const ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
var apiai = require("apiai");
//d0eefe002d5243d8bb40b17345111f28
var appli = apiai("c7d8de5955a74ef7897a5f729382a378");
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');


//c7d8de5955a74ef7897a5f729382a378

// Pretty JSON output for logs
const prettyjson = require('prettyjson');
// Join an array of strings into a sentence
// https://github.com/epeli/underscore.string#tosentencearray-delimiter-lastdelimiter--string
const toSentence = require('underscore.string/toSentence');


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

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

// Handle webhook requests
app.post('/', function (req, res, next) {
    // Log the request headers and body, to aide in debugging. You'll be able to view the
    // webhook requests coming from API.AI by clicking the Logs button the sidebar.
    logObject('Request headers: ', req.headers);
    logObject('Request body: ', req.body);

    // Instantiate a new API.AI assistant object.
    const assistant = new ApiAiAssistant({ request: req, response: res });

    // Declare constants for your action and parameter names
    const YES_NO_ANSWER = 'everything.action' // The action name from the API.AI intent
    const WELCOME_INTENT = 'input.welcome'



    const YES_NO_RESPONSE = 'yesNoResponse' // An API.ai parameter name
    const MCQ_RESPONSE = 'mcq-entity'
    const TIME_INTERVAL = 'timeInterval'

    //Data for Editing user entities.
    function userEntitiesData(sessionId, question, name) {
        //Think of adding other values for changing question types.
        var user_entities = [{
            name: name,
            extend: false,
            entries: [{
                value: "repeat",
                synonyms: ["options", "repeat", "come again"]
            }]
        }];
        logObject('user_entities: ', user_entities)
        question.choices.forEach(function (element) {
            var entities = {
                value: "",
                synonyms: []
            }
            entities.value = element;
            entities.synonyms.push(element);
            user_entities[0].entries.push(entities);
        }, this);

        var returnValue = {
            sessionId: sessionId,
            entities: user_entities
        };

        return returnValue
    } 

    function nextQuestion(sessionId, appli) {
        var question = easy.shift()
        if(question != undefined){
            //Give the next question and also setups anything required for the session.
            switch (question.type) {
                case "MultipleChoice":
                    //Need to update entities
                    // Create a new promise
                    var data = userEntitiesData(sessionId, question, MCQ_RESPONSE)
                    var toTell = new Promise(function (resolve, reject) {
                        let user_entities_request = appli.userEntitiesRequest(data);
                        user_entities_request.on("response", (response) => {
                            console.log("I am all done");
                            resolve(question.title)
                        });
                        user_entities_request.on('error', function (err) {
                            logObject('Error', err);
                            reject("There was an error.");
                        });
                        user_entities_request.end();
                    });
                    return toTell;
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
            return "Thank You for participating in the survey"
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
        
        //Next question string
        nextQuestion(req.body.sessionId, appli).then(function(toTell){
            console.log('To tell: ' + toTell)
            assistant.tell(toTell)
        })
    }

    function welcomeIntent(assistant){
        console.log('Handling Action: Welcome Intent')
        //Need to change to work with mcq questions.
        // let answer = assistant.getArgument(YES_NO_RESPONSE);
        //Next Question to tell.

        // getUserEntities(req.body.sessionId, YES_NO_RESPONSE)
        // .then(function(response){
        //     nextQuestion(req.body.sessionId, appli).then(function (toTell) {
        //         console.log('To tell: ' + toTell)
        //         assistant.tell(toTell)
        //     })
        // })
        // .catch(function (error) {
        //     console.log("Error: "+error)
        // })
        
        nextQuestion(req.body.sessionId, appli).then(function (toTell) {
            console.log('To tell: ' + toTell)
            assistant.tell(toTell)
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
let server = app.listen(9109, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

