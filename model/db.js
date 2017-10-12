const database = require('firebase').database()


exports.getUserInformation = function getUserInformation(key){
    let ref = database.ref('users/'+key)
    let user = new Promise((resolve, reject) => {
        ref.once('value')
        .then(function(snapshot){
            resolve(snapshot.val())
        })
        .catch(function(error){
            reject(null);
        })
    })
    return user;
}

exports.takingSurveys = function takingSurveys(takingObj){
    let blueprints = []
    for(var key in takingObj){
        blueprints.push(database.ref('blueprints/'+takingObj[key]).once('value'))
    }
    let surveyPromise = new Promise((resolve, reject) => {
        Promise.all(blueprints)
        .then((snapshots) => {
            let returnSurvey = {}
            snapshots.forEach((snapshot) => {
                if(snapshot.val()) returnSurvey[snapshot.key] = snapshot.val();
            })
            resolve(returnSurvey)
        })
        .catch((error) => {
            reject(null)
        })
    })
    return surveyPromise
}
