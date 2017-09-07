var userEntities = {
    sessionId: null,
    entities: [{
        name: 'mcq-entity',
        extend: false,
        entries: [{
            value: "repeat",
            synonyms: ["options", "repeat", "again"]
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
        }
        ]
    }]
}

module.exports = userEntities;