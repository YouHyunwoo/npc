import { Place } from "../game/place/place.js";
import { EventEmitter } from '../utility/event.js';
import { StoreOwner } from './store-owner.js';
import { Customer } from './customer.js';

export class Street {

    constructor({
        size,
    }={}) {
        this.size = size;
    }
}

export class Store extends Place {

    id = 'store';

    player;
    street;
    level;
    capacity;
    events;

    owner;

    customers = [];

    constructor({
        player,
        street,
        level=1,
        capacity=0,
        events={},
    }={}) {
        super();

        this.street = street;
        this.level = level;
        this.capacity = capacity;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.owner = new StoreOwner({ store: this, player });
        this.sellingItems = [];
    }

    getStreetSize() {
        return this.street.size;
    }

    getCustomers() {
        return this.customers;
    }

    getCustomerCount() {
        return this.customers.length;
    }

    enter(hero) {
        if (this.customers.length >= this.capacity) { return null }

        const customer = new Customer({
            hero,
            store: this,
            events: {
                exit: customer => {
                    this.exit(hero);
                },
            },
        });

        this.customers.push(customer);

        this.events.emit('enter', customer);

        return customer;
    }

    exit(hero) {
        const customer = this.customers.find(customer => customer.hero === hero);
        if (customer == null) { return }

        const index = this.customers.indexOf(customer);
        this.customers.splice(index, 1);

        this.events.emit('exit', customer);
    }

    upgrade() {
        this.level += 1;
        this.capacity = Math.floor(this.capacity * 1.5);
        this.street.size[0] *= 2;

        this.events.emit('upgrade');
    }
}

// 상점에 고객이 들어오거나 나감
// 고객은 상점에서 파는 물건을 보고 살지 말지 결정함
// 고객이 살게 생기면 고객의 상태가 변함 -> 거래가능
// 거래 가능한 고객을 누르면 거래창이 뜸
// 거래 시 고객의 상태가 변함 -> 거래완료
// 거래 완료한 고객은 조금 있다가 나가거나 아이템 및 장비를 사용하는 걸 보여주고 나감(+)