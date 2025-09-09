const database = {
    // 난이도
    assets: {},
    store: {
        upgrade: [
            {
                level: 1,
                capacity: 5,
                cost: 100,
                tax: 0.1,
                questCommissionCost: 0.1,
            },
            {
                level: 2,
                capacity: 10,
                cost: 1000,
                tax: 0.085,
                questCommissionCost: 0.095,
            },
            {
                level: 3,
                capacity: 10,
                cost: 10000,
                tax: 0.05,
                questCommissionCost: 0.08,
            },
        ],
    },
    hero: {
        names: [
            'Jake', 'Ava', 'Kyle', 'Liam', 'Dylan', 'Noah', 'Ethan', 'William', 'Daniel', 'Alex', 'Kevin',
        ],
        statistics: {
            level: 1,
            experience: 0,
            maxExperience: 5,
            health: 5,
            maxHealth: 5,
            healthRecoveringSpeed: 1,
            attackPower: 1,
            defensePower: 0,
            attackSpeed: 0.5,
            bravery: Math.random() * 0.1,
        },
        levelUpPoints: 2,
        growths: [
            { id: 'health', value: 10 },
            { id: 'attackPower', value: 1 },
            { id: 'defensePower', value: 1 },
            { id: 'attackSpeed', value: 0.05 },
        ],
    },
    places: {
        village: {
            id: 'village',
            name: '🏡마을',
        },
        store: {
            id: 'store',
            name: '🍖상점',
        },
        guild: {
            id: 'guild',
            name: '🏰길드',
        },
        field: {
            id: 'field',
            name: '🌲필드',
        },
    },
    renderables: {
        images: {},
        sprites: {
            'hero-placeholder': {
                type: 'sprite',
                source: 'resources/images/hero-placeholder.png',
                anchor: [0.5, 0.5],
                scale: [3, 3],
            },
            'speech-balloon': {
                type: 'sprite',
                source: 'resources/images/speech-balloon.png',
                anchor: [0.5, 0.5],
                scale: [3, 3],
            },
            'cherry': {
                type: 'sprite',
                source: 'resources/images/cherry.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'herb': {
                type: 'sprite',
                source: 'resources/images/herb.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'branch': {
                type: 'sprite',
                source: 'resources/images/branch.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'stone': {
                type: 'sprite',
                source: 'resources/images/stone.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'wooden-sword': {
                type: 'sprite',
                source: 'resources/images/wooden-sword.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'wooden-sword-2': {
                type: 'sprite',
                source: 'resources/images/wooden-sword.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
            },
            'black-slime': {
                type: 'sprite',
                source: 'resources/images/black-slime.png',
                anchor: [0.5, 0.8],
                scale: [1, 1],
                sourceArea: [0, 0, 28, 20],
            },
            'black-slime-dead': {
                type: 'sprite',
                source: 'resources/images/black-slime.png',
                anchor: [0.5, 0.8],
                scale: [1, 1],
                sourceArea: [28, 0, 28, 20],
            },
            'small-potion': {
                type: 'sprite',
                source: 'resources/images/potion.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
                sourceArea: [0, 0, 6, 11],
            },
            'medium-potion': {
                type: 'sprite',
                source: 'resources/images/potion.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
                sourceArea: [6, 0, 6, 11],
            },
            'large-potion': {
                type: 'sprite',
                source: 'resources/images/potion.png',
                anchor: [0.5, 0.5],
                scale: [1, 1],
                sourceArea: [12, 0, 6, 11],
            },
        }
    },
    items: {
        'small-potion': {
            id: 'small-potion',
            name: '소형 포션',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'self', amount: 5, on: 'consume' },
            ],
        },
        'medium-potion': {
            id: 'medium-potion',
            name: '중형 포션',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'self', amount: 20, on: 'consume' },
            ],
        },
        'large-potion': {
            id: 'large-potion',
            name: '대형 포션',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'self', amount: 60, on: 'consume' },
            ],
        },
        'cherry': {
            id: 'cherry',
            name: '체리',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'self', amount: 3, on: 'consume' },
            ],
        },
        'herb': {
            id: 'herb',
            name: '약초',
            type: 'material',
        },
        'leather': {
            id: 'leather',
            name: '가죽',
            type: 'material',
        },
        'bone': {
            id: 'bone',
            name: '뼈',
            type: 'material',
        },
        'meat': {
            id: 'meat',
            name: '고기',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'consumer', amount: 6, on: 'consume' },
            ],
        },
        'steak': {
            id: 'steak',
            name: '스테이크',
            type: 'consumable',
            effects: [
                { type: 'increase-health', target: 'consumer', amount: 30, on: 'consume' },
                // { type: 'increase-attack-speed', target: 'consumer', amount: 0.1, duration: 60 on: 'consume' },
            ],
        },
        'iron': {
            id: 'iron',
            name: '철',
            type: 'material',
        },
        'branch': {
            id: 'branch',
            name: '나뭇가지',
            type: 'material',
        },
        'wood': {
            id: 'wood',
            name: '목재',
            type: 'material',
        },
        'stone': {
            id: 'stone',
            name: '돌멩이',
            type: 'material',
        },
        'wooden-sword': {
            id: 'wooden-sword',
            name: '나무검',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    1, on: 'equip' },
                { type: 'decrease-attack-speed', target: 'self', amount: 0.02, on: 'equip' },
            ],
        },
        'wooden-sword-2': {
            id: 'wooden-sword-2',
            name: '나무검2',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    2, on: 'equip' },
                { type: 'decrease-attack-speed', target: 'self', amount: 0.02, on: 'equip' },
            ],
        },
        'wooden-sword-3': {
            id: 'wooden-sword-3',
            name: '나무검3',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    3, on: 'equip' },
                { type: 'decrease-attack-speed', target: 'self', amount: 0.01, on: 'equip' },
            ],
        },
        'bone-sword': {
            id: 'bone-sword',
            name: '뼈검',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    2, on: 'equip' },
                { type: 'decrease-attack-speed', target: 'self', amount: 0.02, on: 'equip' },
            ],
        },
        'bone-sword-2': {
            id: 'bone-sword-2',
            name: '뼈검2',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    3, on: 'equip' },
                { type: 'decrease-attack-speed', target: 'self', amount: 0.01, on: 'equip' },
            ],
        },
        'teeth': {
            id: 'teeth',
            name: '이빨',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-attack-power', target: 'self', amount:    5, on: 'equip' },
                { type: 'increase-attack-speed', target: 'self', amount: 0.01, on: 'equip' },
            ],
        },
        'wooden-armor': {
            id: 'wooden-armor',
            name: '나무갑옷',
            type: 'equipment',
            part: 'body',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:    1, on: 'equip' },
                { type:  'decrease-attack-speed', target: 'self', amount: 0.05, on: 'equip' },
            ],
        },
        'stone-armor': {
            id: 'stone-armor',
            name: '돌갑옷',
            type: 'equipment',
            part: 'body',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:    3, on: 'equip' },
                { type:  'decrease-attack-speed', target: 'self', amount:  0.1, on: 'equip' },
            ],
        },
        'stone-armor-2': {
            id: 'stone-armor-2',
            name: '돌갑옷2',
            type: 'equipment',
            part: 'body',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:    5, on: 'equip' },
                { type:  'decrease-attack-speed', target: 'self', amount: 0.08, on: 'equip' },
            ],
        },
        'iron-armor': {
            id: 'iron-armor',
            name: '철갑옷',
            type: 'equipment',
            part: 'body',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:    6, on: 'equip' },
                { type:  'decrease-attack-speed', target: 'self', amount:  0.2, on: 'equip' },
            ],
        },
        'goblin-sword': {
            id: 'goblin-sword',
            name: '고블린 검',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:   10, on: 'equip' },
            ],
        },
        'goblin-staff': {
            id: 'goblin-staff',
            name: '고블린 지팡이',
            type: 'equipment',
            part: 'hand',
            effects: [
                { type: 'increase-defense-power', target: 'self', amount:   20, on: 'equip' },
                { type:  'decrease-attack-speed', target: 'self', amount:  0.3, on: 'equip' },
            ],
        },
    },
    monsters: {
        'green-slime': {
            id: 'green-slime',
            name: '녹색 슬라임',
            statistics: {
                level: 1,
                experience: 1,
                health: 3,
                attackPower: 1,
                defensePower: 0,
                attackSpeed: 0.4,
            },
            inventory: {
                golds: 5,
                itemBundles: [
                    { item: { id: 'cherry' }, count: 1 },
                ],
                probabilities: {
                    'golds': 0.2,
                    'cherry': 0.1,
                },
            },
        },
        'red-slime': {
            id: 'red-slime',
            name: '빨간 슬라임',
            statistics: {
                level: 3,
                experience: 3.5,
                health: 25,
                attackPower: 3,
                defensePower: 0,
                attackSpeed: 0.5,
            },
            inventory: {
                golds: 10,
                itemBundles: [
                    { item: { id: 'cherry' }, count: 2 },
                ],
                probabilities: {
                    'golds': 0.2,
                    'cherry': 0.1,
                },
            },
        },
        'blue-slime': {
            id: 'blue-slime',
            name: '파란 슬라임',
            statistics: {
                level: 6,
                experience: 9,
                health: 60,
                attackPower: 5,
                defensePower: 2,
                attackSpeed: 0.4,
            },
            inventory: {
                golds: 20,
                itemBundles: [
                    { item: { id: 'cherry' }, count: 5 },
                ],
                probabilities: {
                    'golds': 0.2,
                    'cherry': 0.1,
                },
            },
        },
        'black-slime': {
            id: 'black-slime',
            name: '검은 슬라임',
            statistics: {
                level: 10,
                experience: 30,
                health: 70,
                attackPower: 9,
                defensePower: 3,
                attackSpeed: 0.6,
            },
            inventory: {
                golds: 30,
                itemBundles: [
                    { item: { id: 'cherry' }, count: 5 },
                ],
                probabilities: {
                    'golds': 0.2,
                    'cherry': 0.1,
                },
            },
        },
        'devourer': {
            id: 'devourer',
            name: '포식자',
            statistics: {
                level: 12,
                experience: 140,
                health: 150,
                attackPower: 12,
                defensePower: 4,
                attackSpeed: 0.7,
            },
            inventory: {
                golds: 100,
                itemBundles: [
                    { item: { id: 'cherry' }, count: 10 },
                ],
                probabilities: {
                    'golds': 0.5,
                    'cherry': 0.1,
                },
            },
        },
        'deer': {
            id: 'deer',
            name: '사슴',
            statistics: {
                level: 2,
                experience: 3.2,
                health: 20,
                attackPower: 1,
                defensePower: 1,
                attackSpeed: 0.3,
            },
            inventory: {
                golds: 0,
                itemBundles: [
                    { item: { id: 'herb' }, count: 1 },
                    { item: { id: 'leather' }, count: 1 },
                    { item: { id: 'bone' }, count: 2 },
                    { item: { id: 'meat' }, count: 2 },
                ],
                probabilities: {
                    'herb': 0.3,
                    'leather': 0.3,
                    'bone': 0.3,
                    'meat': 0.3,
                },
            },
        },
        'wild-boar': {
            id: 'wild-boar',
            name: '멧돼지',
            statistics: {
                level: 5,
                experience: 7,
                health: 50,
                attackPower: 5,
                defensePower: 2,
                attackSpeed: 0.2,
            },
            inventory: {
                golds: 0,
                itemBundles: [
                    { item: { id: 'herb' }, count: 1 },
                    { item: { id: 'leather' }, count: 2 },
                    { item: { id: 'bone' }, count: 3 },
                    { item: { id: 'meat' }, count: 4 },
                ],
                probabilities: {
                    'herb': 0.3,
                    'leather': 0.3,
                    'bone': 0.3,
                    'meat': 0.3,
                },
            },
        },
        'wolf': {
            id: 'wolf',
            name: '늑대',
            statistics: {
                level: 8,
                experience: 15,
                health: 50,
                attackPower: 8,
                defensePower: 2,
                attackSpeed: 0.5,
            },
            inventory: {
                golds: 0,
                itemBundles: [
                    { item: { id: 'herb' }, count: 1 },
                    { item: { id: 'leather' }, count: 3 },
                    { item: { id: 'bone' }, count: 5 },
                    { item: { id: 'meat' }, count: 3 },
                ],
                probabilities: {
                    'herb': 0.3,
                    'leather': 0.3,
                    'bone': 0.3,
                    'meat': 0.3,
                },
            },
        },
        'bear': {
            id: 'bear',
            name: '곰',
            statistics: {
                level: 13,
                experience: 55,
                health: 100,
                attackPower: 10,
                defensePower: 5,
                attackSpeed: 0.5,
            },
            inventory: {
                golds: 0,
                itemBundles: [
                    { item: { id: 'herb' }, count: 1 },
                    { item: { id: 'leather' }, count: 5 },
                    { item: { id: 'bone' }, count: 6 },
                    { item: { id: 'meat' }, count: 8 },
                ],
                probabilities: {
                    'herb': 0.3,
                    'leather': 0.3,
                    'bone': 0.3,
                    'meat': 0.3,
                },
            },
        },
        'goblin': {
            id: 'goblin',
            name: '고블린',
            statistics: {
                level: 11,
                experience: 40,
                health: 80,
                attackPower: 9,
                defensePower: 5,
                attackSpeed: 0.4,
            },
            inventory: {
                golds: 20,
                itemBundles: [
                    { item: { id: 'iron' }, count: 1 },
                ],
                probabilities: {
                    'gold': 0.6,
                    'iron': 0.5,
                },
            },
        },
        'goblin-thief': {
            id: 'goblin-thief',
            name: '고블린 도적',
            statistics: {
                level: 15,
                experience: 110,
                health: 50,
                attackPower: 18,
                defensePower: 2,
                attackSpeed: 1,
            },
            inventory: {
                golds: 70,
                itemBundles: [
                    { item: { id: 'iron' }, count: 5 },
                ],
                probabilities: {
                    'gold': 0.8,
                    'iron': 0.7,
                },
            },
        },
        'goblin-warrior': {
            id: 'goblin-warrior',
            name: '고블린 전사',
            statistics: {
                level: 17,
                experience: 180,
                health: 160,
                attackPower: 11,
                defensePower: 6,
                attackSpeed: 0.5,
            },
            inventory: {
                golds: 50,
                itemBundles: [
                    { item: { id: 'iron' }, count: 3 },
                    { item: { id: 'goblin-sword' }, count: 1 },
                ],
                probabilities: {
                    'gold': 0.6,
                    'iron': 0.5,
                    'goblin-sword': 0.07,
                },
            },
        },
        'goblin-shaman': {
            id: 'goblin-shaman',
            name: '고블린 주술사',
            statistics: {
                level: 20,
                experience: 400,
                health: 70,
                attackPower: 30,
                defensePower: 4,
                attackSpeed: 0.2,
            },
            inventory: {
                golds: 100,
                itemBundles: [
                    { item: { id: 'iron' }, count: 10 },
                    { item: { id: 'goblin-staff' }, count: 1 },
                ],
                probabilities: {
                    'gold': 0.6,
                    'iron': 0.5,
                    'goblin-staff': 0.05,
                },
            },
        },
        'goblin-chieftain': {
            id: 'goblin-chieftain',
            name: '고블린 족장',
            statistics: {
                level: 22,
                experience: 4200,
                health: 250,
                attackPower: 20,
                defensePower: 10,
                attackSpeed: 0.6,
            },
            inventory: {
                golds: 500,
                itemBundles: [
                    { item: { id: 'iron' }, count: 20 },
                    { item: { id: 'goblin-head' }, count: 1 },
                ],
                probabilities: {
                    'gold': 0.7,
                    'iron': 0.5,
                    'goblin-head': 0.01,
                },
            },
        },
        'skeleton': {
            id: 'skeleton',
            name: '해골',
            statistics: {
                level: 40,
                experience: 4200,
                health: 250,
                attackPower: 20,
                defensePower: 10,
                attackSpeed: 0.6,
            },
            inventory: {
                golds: 500,
                itemBundles: [
                    { item: { id: 'bone' }, count: 20 },
                    { item: { id: 'ruby' }, count: 1 },
                ],
                probabilities: {
                    'gold': 0.7,
                    'bone': 0.5,
                    'ruby': 0.1,
                },
            },
        },
        'demon': {
            id: 'demon',
            name: '마왕',
            statistics: {
                level: 50,
                experience: 0,
                health: 1000,
                attackPower: 50,
                defensePower: 50,
                attackSpeed: 0.2,
            },
            inventory: {
                golds: 0,
                itemBundles: [],
            },
        },
    },
    recipes: {
        'small-potion': {
            id: 'small-potion',
            blueprint: [
                [1],
                [1, 2],
            ],
            materialItemIds: [
                'cherry',
                'herb',
            ],
            resultItemModelBundles: [
                {
                    itemModel: { id: 'small-potion', enhancements: [{ type: 'health', value: 5 }]},
                    count: 1,
                },
            ],
        },
        'medium-potion': {
            id: 'medium-potion',
            blueprint: [
                [1, 2],
                [1, 2],
                [1, 2],
            ],
            materialItemIds: [
                'cherry',
                'herb',
            ],
            resultItemModelBundles: [
                {
                    itemModel: { id: 'medium-potion', enhancements: [{ type: 'health', value: 10 }]},
                    count: 1,
                },
            ],
        },
        'large-potion': {
            id: 'large-potion',
            blueprint: [
                [1, 2],
                [1, 2],
                [1, 2],
                [1, 2],
                [1, 2],
            ],
            materialItemIds: [
                'cherry',
                'herb',
            ],
            resultItemModelBundles: [
                {
                    itemModel: { id: 'large-potion', enhancements: [{ type: 'hp', value: 20 }]},
                    count: 1,
                },
            ],
        },
        'wooden-sword': {
            id: 'wooden-sword',
            blueprint: [
                [1],
                [1],
                [1],
            ],
            materialItemIds: [
                'branch',
            ],
            resultItemModelBundles: [
                {
                    itemModel: { id: 'wooden-sword', enhancements: [{ type: 'ap', value: 1 }]},
                    count: 1,
                },
            ],
        },
    },
};

export default database;