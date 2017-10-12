// server.js
// where your node app starts

//Frameworks
const express = require('express');
const request = require('request');
const session = require('express-session')
const Map = require('es6-map');
const prettyjson = require('prettyjson');
const toSentence = require('underscore.string/toSentence');
const firebase = require('firebase')

var config = {
    apiKey: "AIzaSyDCXmuzo8VIr0pKE9pSlLBFhOSnuwjgyVQ",
    authDomain: "surveyapp-87ddd.firebaseapp.com",
    databaseURL: "https://surveyapp-87ddd.firebaseio.com",
    projectId: "surveyapp-87ddd",
    storageBucket: "surveyapp-87ddd.appspot.com",
    messagingSenderId: "698556221027"
  };
firebase.initializeApp(config);

//Google and API.AI
const DialogflowApp = require('actions-on-google').DialogflowApp;
// const apiai = require("apiai"); 
const bodyParser = require('body-parser');

//Models
const Entities = require("./model/entities.js");
const Question = require("./model/question");
const db = require("./model/db");

// init project
const app = express();
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
    // console.log("+==============++==============+")
    // console.log("Session id in session: "+currentSession.sessionId)
    // //Body id keeps changing
    // console.log("Request body id: " + req.body.id)
    // console.log("Session id from api.ai: " + req.body.sessionId)
    // console.log("+==============++==============+")
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
    const assistant = new DialogflowApp({ request: req, response: res });

    // Declare constants for your action and parameter names
    const YES_NO_ANSWER = 'everything.action' // The action name from the API.AI intent
    const WELCOME_INTENT = 'input.welcome'
    const OPTION_INTENT = 'option.select';



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
        question.navigation(questionResponse)
            .then(function(toTell){
                currentSession = question.getData("currentSession")
                assistant.ask(toTell)
            })  
            .catch(function(error){
                currentSession = question.getData("currentSession")
                logObject("Error Object: ", error)
                assistant.tell("Something went wrong somewhere.")
            })
    }

    function welcomeIntent(assistant){
        console.log('Handling Action: Welcome Intent')
        //Define session variables
        if(assistant.getUser()){
            //User log in exsists
            if(!firebase.auth().currentUser){
                console.log('I come here')
                firebase.auth().signInWithCustomToken(assistant.getUser().accessToken)
                .then((user) => {
                    db.getUserInformation(firebase.auth().currentUser.uid)
                    .then((userInformation) => {
                        console.log(userInformation)
                        currentSession.userInformation =  userInformation;
                        if(userInformation.taking) {
                            db.takingSurveys(userInformation.taking)
                            .then((surveys) => {
                                console.log('Got the surveys back')
                                console.log(surveys)
                                currentSession.surveys = surveys
                                // var options = []
                                // for(let key in currentSession.surveys){
                                //     options.push(assistant.buildOptionItem(key, [currentSession.surveys[key].name]).setTitle(currentSession.surveys[key].name))
                                // }
                                // console.log('Response sent')
                                // assistant.askWithList('Welcome to TigerAware', assistant.buildList('Here are your survyes')
                                // .addItems(options))
                                console.log(assistant.hasSurfaceCapability(assistant.SurfaceCapabilities.SCREEN_OUTPUT))
                                if(assistant.hasSurfaceCapability(assistant.SurfaceCapabilities.SCREEN_OUTPUT))
                                    assistant.askWithList(assistant.buildRichResponse().addSimpleResponse('Welcome to Tiger Aware'), assistant.buildList('here are your choices').addItems(assistant.buildOptionItem('XYS', ["india", "indian"]).setTitle('India')))
                                else
                                    assistant.tell("Doesn't have a screen")
                            })
                            .catch((error) => {
                                console.log(error)
                                console.log('Someother shitty error')
                                currentSession.surveys = null
                                if(!currentSession.surveys) assistant.tell('There are currently no surveys you can take. Please come back for more')                                 
                            })
                        } else {
                            console.log('this shitty error')
                            currentSession.surveys = null
                            if(!currentSession.surveys) assistant.tell('There are currently no surveys you can take. Please come back for more')                            
                        }
                    })
                    .catch((error) => {
                        currentSession.userInformation = null
                        if(!currentSession.userInformation) assistant.tell('You are not a registered user. Please visit blah.com to register.')                                        
                    }) 
                })
                .catch(function(error){
                    assistant.tell("Login failed, Try again later")
                }) 
            }
        } else {
            assistant.askForSignIn()
        }
        // if(assistant.getUser()){
        //     if(currentSession.surveys && currentSession.userInformation){
        //         //Give him options to select a survey.
        //         let surveysAvailable = assistant.buildList('Here are your surveys')
        //         for(let key in currentSession.surveys){
        //             let option = assistant.buildOptionItem(SELECTION_KEY_ONE, [currentSession.surveys[key].name]).setTitle(currentSession.surveys[key].name)
        //             surveysAvailable.addItems(option)
        //         }
        //         assistant.askWithList('Welcome to TigerAware', surveysAvailable)
        //     } else {
        //         if(!currentSession.userInformation) assistant.tell('You are not a registered user. Please visit blah.com to register.')                
        //         if(!currentSession.surveys) assistant.tell('There are currently no surveys you can take. Please come back for more')            
        //     }
        // } else {
        //     assistant.askForSignIn()
        // }
        // currentSession.currentIndex = 0;
        // currentSession.prevIndex = -1;
        // //Create new question object
        // question = new Question({currentSession: currentSession, survey: survey})
        // //Setup User Entities for Repeat, Skip, Done, Back and Next
        // //returns a promise
        // question.firstQuestion(question)
        //     .then(function (toTell) {
        //         // console.log("********************")
        //         // console.log(toTell)
        //         currentSession = question.getData("currentSession")
        //         console.log("Returned Session id: "+ currentSession.sessionId)
        //         assistant.ask(toTell)
        //     })
        //     .catch(function (err) {
        //         console.log(err)
        //         assistant.tell("Hey something went wrong.")
        //     })
        //Need to return session
    }

    function optionIntent(assistant){
        assistant.tell(assistant.getSelectedOption())
    }


    // Add handler functions to the action router.
    let actionRouter = new Map();

    // Mapping Intents to Functions.
    actionRouter.set(YES_NO_ANSWER, yesNoAnswer);
    actionRouter.set(WELCOME_INTENT, welcomeIntent);
    actionRouter.set(OPTION_INTENT, optionIntent);

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
let server = app.listen(9101, function () {
    console.log('Your app is listening on port ' + server.address().port);
});

