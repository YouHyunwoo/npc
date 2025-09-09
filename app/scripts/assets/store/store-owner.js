export class StoreOwner {

    trade = null;

    constructor({
        store,
        player,
    }={}) {
        this.store = store;
        this.player = player;
    }

    getSellingItemBundles() {
        return this.player.inventory.itemBundles.filter(
            itemBundle => this.store.sellingItems.includes(itemBundle.item)
        );
    }

    isTrading() {
        return this.trade != null;
    }

    isTradingWith(customer) {
        return this.trade != null && this.trade.customer === customer;
    }

    startTrade(customer) {
        this.trade = new Trade({ customer });
    }

    endTrade() {
        this.trade = null;
    }

    offer(price) {
        if (!this.isTrading()) { return }

        const trade = this.trade;

        trade.price = price;

        const tradeResult = new TradeResult({
            success: null,
            customer: trade.customer,
            price,
            itemBundles: trade.itemBundles,
            reason: null,
        });

        const customer = trade.customer;
        const itemBundles = trade.itemBundles;

        if (!this.player.hasItems(...itemBundles)) {
            tradeResult.success = false;
            tradeResult.reason = 'not-enough-items';
        }
        else if (!customer.hasGolds(price)) {
            tradeResult.success = false;
            tradeResult.reason = 'not-enough-golds';
        }
        else {
            customer.buy(price, itemBundles);
            this.#sell(price, itemBundles);

            tradeResult.success = true;
        }

        customer.finishTrade();

        this.endTrade();

        return tradeResult;
    }

    #sell(price, itemBundles) {
        this.player.takeGolds(price);
        this.player.dropItems(...itemBundles);
    }

    reject() {
        const customer = this.trade.customer;

        customer.finishTrade();

        this.endTrade();
    }
}

class Trade {

    customer;
    itemBundles;
    price = null;

    constructor({
        customer,
    }={}) {
        this.customer = customer;
        this.itemBundles = customer.needs;
    }
}

class TradeResult {

    constructor({
        trade,
        customer,
        price,
        items,
        reason,
    }={}) {
        this.trade = trade;
        this.customer = customer;
        this.price = price;
        this.items = items;
        this.reason = reason;
    }
}