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
    "id": "q5",
    "on": "",
    "subtitle": "",
    "title": "Time int",
    "type": "timeInt"
}, {
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
    logObject('Request body: ', req.body);
    console.log("+==============++==============+")
    console.log("Session id in session: "+currentSession.sessionId)
    //Body id keeps changing
    console.log("Request body id: " + req.body.id)
    console.log("Session id from api.ai: " + req.body.sessionId)
    console.log("+==============++==============+")
    // Checking for session error. and updating the session to match conversation ID
    if(!currentSession.sessionId){
        if(currentSession.sessionId != req.body.sessionId){
            currentSession.sessionId = req.body.sessionId
        }
    } else {
        if (currentSession.sessionId != req.body.sessionId) {
            currentSession.sessionId = req.body.sessionId
        } 
    }
    // console.log("Session id in session: "+currentSession.sessionId)
    // Instantiate a new API.AI assistant object.
    const assistant = new ApiAiAssistant({ request: req, response: res });

    // Declare constants for your action and parameter names
    const YES_NO_ANSWER = 'everything.action' // The action name from the API.AI intent
    const WELCOME_INTENT = 'input.welcome'



    const YES_NO_RESPONSE = 'yesNoResponse' // An API.ai parameter name
    const MCQ_RESPONSE = 'mcq-entity'
    const TIME_INTERVAL = 'timeInterval'
    const TEXT_RESPONSE = 'text'
    const TIME_REPSONSE = 'time'
    const DATE_RESPONSE = 'date'
    const NUM_RESPONSE = 'number'

    // Create functions to handle intents here
    function yesNoAnswer(assistant) {
        console.log('Handling action: ' + YES_NO_ANSWER);
         let questionResponse = {};
         questionResponse.yesNoAnswer = assistant.getArgument(YES_NO_RESPONSE);
         questionResponse.mcqAnswer = assistant.getArgument(MCQ_RESPONSE);
         questionResponse.timeInterval = assistant.getArgument(TIME_INTERVAL);
         questionResponse.dateResponse = assistant.getArgument(DATE_RESPONSE);
         questionResponse.timeResponse = assistant.getArgument(TIME_REPSONSE);
         questionResponse.numberResponse = assistant.getArgument(NUM_RESPONSE);
         questionResponse.textResponse = assistant.getArgument(TEXT_RESPONSE)

        // console.log('ID' + req.body.sessionId)
        // logObject("Response Object: ", questionResponse)
        // console.log('*****************************************')
        //Function to validate answers
        // console.log(question)
        question.navigation(questionResponse)
            .then(function(toTell){
                assistant.ask(toTell)
            })  
            .catch(function(error){
                logObject("Error Object: ", error)
                assistant.tell("Something went wrong somewhere.")
            })
    }

    function welcomeIntent(assistant){
        console.log('Handling Action: Welcome Intent')
        //Define session variables
        currentSession.currentIndex = 0;
        currentSession.prevIndex = -1;
        //Create new question object
        question = new Question({currentSession: currentSession, survey: survey})
        //Setup User Entities for Repeat, Skip, Done, Back and Next
        
        //returns a promise
        question.firstQuestion(question)
            .then(function (toTell) {
                // console.log("********************")
                // console.log(toTell)
                currentSession = question.getData("currentSession")
                assistant.ask(toTell)
            })
            .catch(function (err) {
                console.log(err)
                assistant.tell("Hey something went wrong.")
            })
        //Need to return session
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

