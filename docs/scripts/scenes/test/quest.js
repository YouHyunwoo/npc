import { Time } from "../../assets/game/time.js";
import { Guild } from "../../assets/quest/guild.js";
import { QuestInterpreter } from "../../assets/quest/quest-interpreter/interpreter.js";
import { Quest } from "../../assets/quest/quest.js";
import { Scene } from "../../framework/scene.js";

export class TestQuestScene extends Scene {

    willCreate() {
        const guild = this.createGuild();
        const time = Time.create();

        time.update(60);

        this.createQuestWithoutSave(guild, time);
        this.printQuests(guild);
        this.checkIfExpired(guild, time);

        // save guild
        // load guild
    }

    createGuild() {
        const guild = Guild.create({ dataManagementName: 'local-storage' });

        return guild;
    }

    createQuestWithoutSave(guild, time) {
        const quest = Quest.create({
            objectives: [
                { type: 'collect', target: { type: 'item', id: 'cherry', amount: 4 } },
                { type: 'hunt', target: { type: 'monster', id: 'red-slime', amount: 4 } },
            ],
            deadline: time.elapsedTime + 120, // 단위: 초
            rewards: [
                { type: 'item', id: 'small-potion', amount: 1 },
                { type: 'gold', amount: 1 },
            ],
        });

        guild.library.registerQuest(quest);
    }

    printQuests(guild) {
        const interpreter = new QuestInterpreter({ quest: null });

        for (const quest of guild.library.quests) {
            interpreter.quest = quest;

            console.log('퀘스트 목표', interpreter.getObjectives());
            console.log('퀘스트 기한', interpreter.getDeadline());
            console.log('퀘스트 보상', interpreter.getRewards());
            console.log('퀘스트 상태', interpreter.getStatus());
            console.log('퀘스트 완료자', interpreter.getDedicator());
        }
    }

    checkIfExpired(guild, time) {
        const quest = guild.library.quests[0];

        console.log(quest.isExpired(time.elapsedTime));

        time.update(60);

        console.log(quest.isExpired(time.elapsedTime));

        time.update(300);

        console.log(quest.isExpired(time.elapsedTime));
    }
}