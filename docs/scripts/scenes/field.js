import { Scene } from '../framework/scene.js';
import { LogController, LogView } from "../assets/log/log-view.js";
import random from '../assets/utility/random.js';
import database from '../assets/database.js';
import { View } from '../assets/ui/view.js';
import { StoreScene } from './store.js';
import { MenuView } from "../assets/menu/menu-view.js";
import { CraftScene } from "./craft.js";
import { GuildScene } from "./guild.js";
import { StatisticsScene } from "./statistics.js";
import { Object, ObjectController, ObjectVisible } from "../assets/field/object.js";
import { Item, ItemBundle } from "../assets/game/item.js";
import { Monster, MonsterController, MonsterVisible } from "../assets/field/monster.js";

export class FieldScene extends Scene {

    willCreate() {
        const game = globalThis.game;

        const logController = new LogController({
            logger: game.logger,
            maxLogCount: 5,
        });

        const screenSize = globalThis.screen.size;
        const fieldSize = screenSize.sub([0, 200]);

        this.field = {
            size: fieldSize,
            generation: {
                maxObjectCount: 10,
                probability: 0.1,
                itemIdList: ['cherry', 'herb', 'branch', 'stone'],
            },
        };

        this.add(this.#createFieldMonsterObject('black-slime'));
        this.add(this.#createFieldMonsterObject('black-slime'));

        const objects = [
            this.staminaView = new View({
                name: 'stamina-bar',
                size: [screenSize[0], 5],
                backgroundColor: 'white',
            }),
            this.logView = new LogView({
                position: [0, 70],
                size: [View.Size.Wrap, View.Size.Wrap],
                padding: 10,
                controller: logController,
            }),
            new MenuView({
                size: [View.Size.Fill, 70],
                time: game.time,
                player: game.player,
                events: {
                    'click-menu-item': menuItemId => {
                        const scenes = {
                            store: StoreScene,
                            craft: CraftScene,
                            quest: GuildScene,
                            statistics: StatisticsScene,
                        };

                        const sceneType = scenes[menuItemId];
                        const existScene = sceneType != null;
                        if (existScene) {
                            globalThis.application.transit(new sceneType());
                        }
                    },
                },
            }),
        ];

        objects.forEach(object => this.add(object));

        this.logger = game.logger;
        this.stamina = 100;

        this.camera.position.set(this.field.size.div(2));
    }

    #createFieldMonsterObject(monsterId) {
        const fieldSize = this.field.size;

        const monsterData = database.monsters[monsterId];

        const monster = new Monster({
            fieldSize,
            fieldObjectVisibles: this.objects,
            position: random.generate(2).mul(fieldSize),
            speed: 50,
            renderables: {
                alive: database.assets.renderables.sprites[monsterId],
                dead: database.assets.renderables.sprites[`${monsterId}-dead`],
            },
            health: monsterData.statistics.health,
        });

        const monsterController = new MonsterController({
            monster,
        });

        const monsterVisible = new MonsterVisible({
            controller: monsterController,
        });

        return monsterVisible;
    }

    didCreate() {
        this.onLog = (message, log) => {
            this.logView.refresh();
        }

        this.logger.events.on('log', this.onLog);
    }

    onUpdate(deltaTime) {
        globalThis.game.update(deltaTime);

        this.staminaView.width = this.stamina / 100 * globalThis.screen.size[0];

        this.#generateFieldItemObject();
        this.#deleteFieldItemObject();
    }

    #generateFieldItemObject() {
        const maxObjectCount = this.field.generation.maxObjectCount;
        const generationProbability = this.field.generation.probability;

        if (this.objects.length >= maxObjectCount) { return }
        if (Math.random() >= generationProbability) { return }

        const itemId = random.pick(this.field.generation.itemIdList);
        const objectVisible = this.#createFieldItemObject(itemId);

        this.add(objectVisible);
    }

    #createFieldItemObject(itemId) {
        const fieldSize = this.field.size;

        const object = new Object({
            position: random.generate(2).mul(fieldSize),
            renderables: {
                default: database.assets.renderables.sprites[itemId],
            },
        });

        const objectController = new ObjectController({
            object,
        });

        const objectVisible = new ObjectVisible({
            controller: objectController,
            events: {
                collect: () => {
                    const player = globalThis.game.player;
                    const itemData = database.items[itemId];
                    const itemCount = Math.floor(Math.random() * 5) + 1;
                    player.takeItems(
                        new ItemBundle({
                            item: Item.create(itemData),
                            count: itemCount,
                        })
                    );

                    this.logger.log(`획득: ${itemData.name} ${itemCount}개`);

                    this.stamina -= 10;

                    if (this.stamina <= 0) {
                        globalThis.application.transit(new StoreScene());
                    }
                },
            },
        });

        return objectVisible;
    }

    #deleteFieldItemObject() {
        this.objects.filter(
            objectVisible => objectVisible instanceof ObjectVisible && objectVisible.controller.object.collected
        ).forEach(object => {
            this.remove(object);
        });
    }

    onRender(context, screenSize) {
        this.renderBackground(context, screenSize);
    }

    renderBackground(context, screenSize) {
        context.fillStyle = 'green';
        context.fillRect(0, 0, ...this.field.size);
    }
}