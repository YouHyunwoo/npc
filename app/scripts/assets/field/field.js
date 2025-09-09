import { Place } from "../game/place/place.js";
import { EventEmitter } from '../utility/event.js';
import { Adventurer } from './adventurer.js';

export class Field extends Place {

    id = 'field';

    monsterDatabase;
    itemDatabase;
    player;
    events;

    adventurers = [];

    constructor({
        monsterDatabase,
        itemDatabase,
        player,
        events={},
    }={}) {
        super();

        this.monsterDatabase = monsterDatabase;
        this.itemDatabase = itemDatabase;
        this.player = player;
        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    enter(hero, boss=false) {
        const adventurer = new Adventurer({
            monsterDatabase: this.monsterDatabase,
            itemDatabase: this.itemDatabase,
            player: this.player,
            boss,
            hero,
            events: {
                exit: adventurer => {
                    this.exit(hero);
                },
            },
        });

        this.adventurers.push(adventurer);

        this.events.emit('enter', adventurer);

        return adventurer;
    }

    exit(hero) {
        const adventurer = this.adventurers.find(adventurer => adventurer.hero === hero);
        if (adventurer == null) { return }

        this.adventurers.remove(adventurer);

        this.events.emit('exit', adventurer);
    }
}