var schema = {
    userEntity: {
        sessionId: null,
        entities: [{
            name: 'mcq-entity',
            extend: false,
            entries: null
        }]
    },
    entries: [{
        value: "Repeat",
        synonyms: ["repeat", "again"]
    },
    {
        value: "Options",
        synonyms: ["options", "choices"]
    },
    {
        value: "Done",
        synonyms: ["Completed", "Done"]
    },
    {
        value: "Skip",
        synonyms: ["skip"]
    },
    {
        value: "Next",
        synonyms: ["Next"]
    },
    {
        value: "Back",
        synonyms: ["Previous", "Back"]
    }],
    questionData: {
        currentSession: null, 
        survey: null, 
        responses: {},
        question:{
            choices: null,
            conditionID: null,
            id: null,
            multipleSelect: null,
            on: null,
            subtitle: null,
            title: null,
            type: null
        }
    }
}

module.exports = schema;