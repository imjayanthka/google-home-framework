import { userEntities } from "./user-data";
import { _ } from "ldash";

var Entities = 


class Entities {
    constructor(data) {
        this.data = this.sanitize(data);
    }

    sanitize(data) {
        data = data || {};
        this.userEntity = userEntities;
        return _.pick(_.defaults(data, this.userEntity), _.keys(this.userEntity));
    }

    addMCQEntries(choices) {
        if (Object.prototype.toString.call(choices) == '[object Array]') {
            for (let choice of choices) {
                _.concat(this.userEntities.entities.entries, {
                    value: choice,
                    synonyms: [choice]
                });
            }
            return this.userEntities;
        }
        return null;
    }
}