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


const db = require("./model/db")

firebase.auth().signInWithEmailAndPassword('tnayaj.k@gmail.com', 'kanugo!992')
.then(function(user){
    console.log("User")
    db.getUserInformation(firebase.auth().currentUser.uid)
    .then((user) => {
        db.takingSurveys(user.taking)
            .then((surveys) => {
                console.log(surveys)
            })
            .catch((error) => {
                if(!error) console.log('Errrrrr')
            })
    })
    .catch((error) => {
        console.log(error)
    })
})
.catch(function(error){
    console.log("error")
    console.log(error)
})