import { Character } from "./character.js";
import { Inventory } from "./inventory.js";
import { CharacterStatistics } from "./statistics.js";
import { PlaceInterpreter } from "../place/interpreter.js";
import { Equipment } from "./equipment.js";
import random from "../../utility/random.js";
import { GameOverScene } from "../../../scenes/game-over.js";
import { QuestNote } from "./quest-note.js";

export class Hero extends Character {

    renderables;

    levelUpPoints;
    growths;

    places;
    #place;
    placeInterpreter;

    questNote;

    agent;

    get place() { return this.#place }
    set place(value) {
        this.#place = value;
        this.placeInterpreter.place = value;
    }

    getPlaceName() {
        return this.placeInterpreter.getName() ?? '';
    }

    getState() {
        return this.agent?.getState() ?? '';
    }

    becomeBrave(amount) {
        this.statistics.bravery = Math.min(this.statistics.bravery + amount, 1);
    }

    becomeTimid(amount) {
        this.statistics.bravery = Math.max(0, this.statistics.bravery - amount);
    }

    levelUp() {
        this.#growRandomly(this.levelUpPoints);

        super.levelUp();
    }

    #growRandomly(points) {
        for (let i = 0; i < points; i++) {
            const growth = random.pick(this.growths);

            if (growth.id === 'health') {
                this.statistics.health.maximum += growth.value;
            }
            else {
                this.statistics[growth.id] += growth.value;
            }
        }
    }

    addQuest(quest) {
        if (quest == null) { return }

        const exists = this.questNote.records.some(record => record.quest.id === quest.id);
        if (exists) { return }

        this.questNote.addQuest(quest);

        this.events.emit('add-quest', quest);
    }

    removeQuest(quest) {
        if (quest == null) { return }

        this.questNote.removeQuest(quest);

        this.events.emit('remove-quest', quest);
    }

    update(deltaTime) {
        this.agent?.update(deltaTime);
    }

    goToVillage() {
        console.log('%c🚶이동%c: 🏡마을', 'font-weight: bold', 'font-weight: normal');

        const village = this.places.village;
        this.place = village;

        const visitor = village.enter(this);

        visitor.events.on('exit', visitor => {
            this.agent = null;
            this.goToStore();
        });

        this.agent = visitor;
    }

    goToStore() {
        console.log('%c🚶이동%c: 🍖상점', 'font-weight: bold', 'font-weight: normal');

        const store = this.places.store;
        this.place = store;

        const customer = store.enter(this);

        if (customer == null) {
            this.goToGuild();
        }
        else {
            customer.events.on('exit', customer => {
                this.agent = null;
                this.goToGuild();
            });

            this.agent = customer;
        }
    }

    goToGuild() {
        console.log('%c🚶이동%c: 🏰길드', 'font-weight: bold', 'font-weight: normal');

        const guild = this.places.guild;
        this.place = guild;

        const member = guild.enter(this);

        const quests = member.lookAround();
        member.acceptQuests(quests);

        member.checkQuestFulfillment();

        member.events.on('exit', member => {
            this.agent = null;

            if (this.statistics.bravery >= 1) {
                this.goToField(true);
            }
            else {
                this.goToField();
            }
        });

        this.goToField();
    }

    goToField(boss=false) {
        console.log('%c🚶이동%c: 🌲필드', 'font-weight: bold', 'font-weight: normal');

        const field = this.places.field;
        this.place = field;

        const adventurer = field.enter(this, boss);

        adventurer.events.on('exit', (boss, adventurer) => {
            this.agent = null;

            if (boss) {
                console.log('보스 사냥 성공!');
                globalThis.application.transit(new GameOverScene());
                return;
            }

            this.goToVillage();
        });

        this.agent = adventurer;
    }

    static create(configurations) {
        const hero = new Hero({
            uuid: globalThis.crypto.randomUUID(),
            id: configurations.id,
            name: configurations.name,
            statistics: new HeroStatistics(configurations.statistics),
            inventory: new Inventory(configurations.inventory),
            equipment: new Equipment(),
        });

        hero.renderables = configurations.renderables;
        hero.levelUpPoints = configurations.levelUpPoints;
        hero.growths = configurations.growths;
        hero.places = configurations.places;

        hero.placeInterpreter = new PlaceInterpreter({ place: null });
        hero.questNote = new QuestNote();

        // for test
        hero.inventory.golds = 100;

        return hero;
    }
}

export class HeroStatistics extends CharacterStatistics {

    bravery;

    constructor({
        bravery,
        ...args
    }={}) {
        super(args);

        this.bravery = bravery;
    }
}