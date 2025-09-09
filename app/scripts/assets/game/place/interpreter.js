import database from "../../database.js";

export class PlaceInterpreter {

    constructor({
        place,
    }={}) {
        this.place = place;
    }

    getName() {
        return database.places[this.place.id].name;
    }
}