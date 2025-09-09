import { Renderable } from "./graphic/renderable.js";

const ROLE = Symbol.for('role');

const asset = {};

function parseDatabase(database) {
    return parseObject(database);
}

function parseObject(object) {
    if (ROLE in object) {
        return parseObjectWithRole(object, asset);
    }
    else {
        return parseObjectWithoutRole(object, asset);
    }
}

function parseObjectWithRole(object) {
    const role = object[ROLE];

    if (role === 'renderable') {
        return parseRenderable(object);
    }
    else {
        return null;
    }
}

export function parseRenderable(renderable) {
    return Renderable.create(renderable);
}

function parseObjectWithoutRole(object) {
    const asset = {};

    for (const key in object) {
        const value = object[key];

        if (typeof value === 'object') {
            asset[key] = parseObject(value);
        }
        else if (value instanceof Array) {
            asset[key] = parseArray(value);
        }
        else {
            asset[key] = value;
        }
    }

    return asset;
}

function parseArray(array) {
    return array.map(value => parseObject(value));
}

export default asset;