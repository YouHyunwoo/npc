import { Place } from "../game/place/place.js";
import { EventEmitter } from "../utility/event.js";
import { LibraryDataManagementFactory } from "./library-data-management/factory.js";
import { Library } from "./library.js";
import { Member } from "./member.js";
import { Receptionist } from './receptionist.js';

export class Guild extends Place {

    id = 'guild';

    monsterDatabase;
    time;
    player;
    events;

    library;
    receptionist;

    members = [];

    constructor({
        monsterDatabase,
        time,
        player,
        library,
        events={},
    }={}) {
        super();

        this.monsterDatabase = monsterDatabase;
        this.time = time;
        this.player = player;
        this.library = library;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.receptionist = Receptionist.create({ guild: this });
    }

    enter(hero) {
        const member = new Member({
            monsters: this.monsterDatabase,
            time: this.time,
            player: this.player,
            hero,
            guild: this,
            events: {
                exit: member => {
                    this.exit(hero);
                },
            },
        });

        this.members.push(member);

        this.events.emit('enter', member);

        return member;
    }

    exit(hero) {
        const member = this.members.find(member => member.hero === hero);
        if (member == null) { return }

        this.members.remove(member);

        this.events.emit('exit', member);
    }

    findReceptionist() {
        return this.receptionist;
    }

    static create({
        monsterDatabase,
        time,
        player,
        dataManagementName=null,
    }={}) {
        const guild = new Guild({
            monsterDatabase,
            time,
            player,
            library: Library.create({ dataManagementName }),
        });

        return guild;
    }

    static load({
        monsterDatabase,
        time,
        player,
        dataManagementName,
    }={}) {
        const guild = new Guild({
            monsterDatabase,
            time,
            player,
            library: LibraryDataManagementFactory.create({ dataManagementName }).load(),
        });

        return guild;
    }
}