import { CraftBench } from "../craft/craft-bench.js";
import { Field } from "../field/field.js";
import { Hero } from "./character/hero.js";
import { Guild } from "../quest/guild.js";
import { Store, Street } from "../store/store.js";
import { Village } from "../village/village.js";
import { Time } from "./time.js";
import { Player } from "./character/player.js";
import random from "../utility/random.js";
import { GameOverScene } from "../../scenes/game-over.js";
import { Monster } from "./character/monster.js";
import { Progress } from "../utility/progress.js";
import { Logger } from "./logger.js";

export class Game {

    time;
    log;
    player;

    village;
    store;
    craftBench;
    guild;
    field;

    heros = [];

    constructor({
        time,
        logger,
        player,
    }={}) {
        this.time = time;
        this.logger = logger;
        this.player = player;

        this.supportProgress = new Progress({
            speed: this.time.speed / (24 * 3600),
            repeat: true,
            events: {
                exceed: () => {
                    // 지원금: 상점 레벨에 따라 지원금이 지급됨
                    const golds = 10 * 10 ** this.store.level;

                    this.logger.log(`지원금이 지급되었습니다: ${golds} 골드`);
                    this.player.takeGolds(golds);

                    // 세금: 거래 많이 할수록 세금 많이 내야함
                    const tax = 10 * this.player.tradeAmount;

                    this.logger.log(`세금을 걷어갔습니다: -${tax} 골드`);
                    this.player.dropGolds(tax);
                    this.player.tradeAmount = 0;
                },
            },
        });
    }

    update(deltaTime) {
        this.time.update(deltaTime);

        if (this.time.days >= 30) {
            globalThis.application.transit(new GameOverScene(false));
        }

        this.supportProgress.update(deltaTime);

        for (const hero of this.heros) {
            hero.update(deltaTime);
        }
    }

    save() {}

    static create(configurations) {
        const game = new Game({
            time: new Time({
                startTime: configurations['start-time'],
                elapsedTime: configurations['elapsed-time'],
                speed: configurations['time-speed'],
            }),
            logger: new Logger(),
            player: Player.create({
                name: configurations['name'],
                statistics: {
                    level: 1,
                    experience: 0,
                    maxExperience: 10,
                    health: 10,
                    maxHealth: 10,
                    healthRecoveringSpeed: 0.1,
                    attackPower: 1,
                    defensePower: 0,
                    attackSpeed: 1,
                },
                inventory: {
                    golds: 100,
                    itemBundles: [],
                },
            }),
            boss: Monster.create(configurations['data']['monster'].demon),
        });

        game.village = new Village();

        game.store = new Store({
            player: game.player,
            street: new Street({
                size: [300, 200],
            }),
            capacity: 3,
        });

        game.craftBench = new CraftBench({
            itemDatabase: configurations['data']['item'],
            recipeDatabase: configurations['data']['recipe'],
            size: [5, 5],
        });

        game.guild = Guild.create({
            monsterDatabase: configurations['data']['monster'],
            time: game.time,
            player: game.player,
        });

        game.field = new Field({
            monsterDatabase: configurations['data']['monster'],
            itemDatabase: configurations['data']['item'],
            player: game.player,
        });

        const heroCount = configurations['hero-count'];
        for (let i = 0; i < heroCount; i++) {
            const hero = Hero.create({
                name: random.pick(configurations['hero-names']),
                statistics: configurations['hero-statistics'],
                renderables: configurations['hero-renderables'],
                levelUpPoints: configurations['hero-level-up-points'],
                growths: configurations['hero-growths'],
                places: {
                    village: game.village,
                    store: game.store,
                    guild: game.guild,
                    field: game.field,
                },
            });

            game.heros.push(hero);
        }

        return game;
    }

    static load(data) {}
}