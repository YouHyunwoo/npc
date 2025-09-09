import { Place } from "../game/place/place.js";
import { EventEmitter } from '../utility/event.js';
import { Visitor } from './visitor.js';

export class Village extends Place {

    id = 'village';

    constructor({
        events={},
    }={}) {
        super();

        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.visitors = [];
    }

    enter(hero) {
        const visitor = new Visitor({
            hero,
            village: this,
            events: {
                exit: visitor => {
                    this.exit(hero);
                },
            },
        });

        this.visitors.push(visitor);

        this.events.emit('enter', visitor);

        return visitor;
    }

    exit(hero) {
        const visitor = this.visitors.find(visitor => visitor.hero === hero);
        if (visitor == null) { return }

        const index = this.visitors.indexOf(visitor);
        this.visitors.splice(index, 1);

        this.events.emit('exit', visitor);
    }
}