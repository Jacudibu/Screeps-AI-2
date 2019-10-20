Creep.prototype.moveAndPush = function(direction) {
    if (!moveCache.creepMoves[this.room.name]) {
        moveCache.creepMoves[this.room.name] = {};
    }

    moveCache.creepMoves[this.room.name][this.name] = direction;
    moveCache.pushees.push(this.name);
};

Creep.prototype.justMove = function(direction) {
    if (!moveCache.creepMoves[this.room.name]) {
        moveCache.creepMoves[this.room.name] = {};
    }
    moveCache.creepMoves[this.room.name][this.name] = direction;
};

moveCache = {
    creepMoves: {},
    pushees: [],

    moveAllCreeps() {
        //let calls = 0;
        //let moves = 0;
        //let successFullPushes = 0;

        //const cpuStartAtStart = Game.cpu.getUsed();
        while(this.pushees.length > 0) {
            //calls++;
            const creepName = this.pushees.pop();
            const creep = Game.creeps[creepName];
            if (!creep) {
                continue;
            }
            const direction = this.creepMoves[creep.room.name][creepName];

            if (!direction) {
                continue;
            }

            this.pushThingsAway(creep, direction);
            //if (this.pushThingsAway(creep, direction)) {
            //    successFullPushes++;
            //}

        }
        //const totalCPU = Game.cpu.getUsed() - cpuStartAtStart - (successFullPushes * 0.2);

        for (let roomName in this.creepMoves) {
            for (let creepName in this.creepMoves[roomName]) {
                //moves++;
                const moveCreep = Game.creeps[creepName];
                if (moveCreep) {
                    moveCreep.move(this.creepMoves[roomName][creepName]);
                }
            }
        }

        //console.log("Creep.moveAndPush Overhead: " + totalCPU + " | calls: " + calls + " | avg: " + (totalCPU / calls) + " | Total moves: " + moves + " | overhead per move(): " + ((totalCPU / calls) / moves));
        this.pushees = [];
        this.creepMoves = {};
    },

    getCreepTargetPosition(creep, direction) {
        switch(direction) {
            case TOP:
                return {x: creep.pos.x,     y: creep.pos.y - 1};
            case TOP_RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y - 1};
            case RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y};
            case BOTTOM_RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y + 1};
            case BOTTOM:
                return {x: creep.pos.x,     y: creep.pos.y + 1};
            case BOTTOM_LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y + 1};
            case LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y};
            case TOP_LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y - 1};
        }
    },

    pushThingsAway(creep, direction) {
        const position = this.getCreepTargetPosition(creep, direction);

        if (position.x < 0 || position.x > 49 || position.y < 0 || position.y > 49) {
            return;
        }

        const foundCreeps = creep.room.lookForAt(LOOK_CREEPS, position.x, position.y);
        if (foundCreeps.length === 0) {
            return;
        }

        const otherCreep = foundCreeps[0];

        if (this.creepMoves[otherCreep.name]) {
            return;
        }

        if (!otherCreep.my) {
            return;
        }

        if (otherCreep.fatigue > 0) {
            return;
        }

        const terrain = creep.room.getTerrain();
        const possibleDirections = [];
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (x === 0 && y === 0) {
                    continue;
                }

                const realPosX = x + otherCreep.pos.x;
                const realPosY = y + otherCreep.pos.y;

                if (this.isValidPushPosition(creep, terrain, realPosX, realPosY)) {
                    possibleDirections.push(this.convertRelativePositionToDirection(x, y));
                }
            }
        }

        otherCreep.move(possibleDirections[_.random(0, possibleDirections.length - 1)]);
        return true;
    },

    isValidPushPosition(creep, terrain, pushPosX, pushPosY) {
        // don't cross room borders
        if (pushPosX < 1 || pushPosX > 48 || pushPosY < 1 || pushPosY > 48) {
            return false;
        }

        if (terrain.get(pushPosX, pushPosY) === TERRAIN_MASK_WALL) {
            return false;
        }

        if (pushPosX === creep.pos.x && pushPosY === creep.pos.y) {
            // swapping should always be possible
            return true;
        }

        if (creep.room.lookForAt(LOOK_CREEPS, pushPosX, pushPosY).length !== 0) {
            return false; // Creep blocking that position
        }

        const structures = creep.room.lookForAt(LOOK_STRUCTURES, pushPosX, pushPosY);
        if (structures.length > 0) {
            for (const structure of structures) {
                if (   structure.structureType === STRUCTURE_ROAD
                    || structure.structureType === STRUCTURE_RAMPART
                    || structure.structureType === STRUCTURE_CONTAINER) {
                    continue;
                }

                return false;
            }
        }

        return true;
    },

    convertRelativePositionToDirection(x, y) {
        // 10 * x + y     x
        //         -1 | 0 |  1
        //       -------------------
        //    -1 | TL | T | TR
        // y   0 |  L | - |  R
        //     1 | BL | B | BR

        switch(x) {
            case -1:
                switch(y) {
                    case -1:
                        return TOP_LEFT;
                    case 0:
                        return LEFT;
                    case 1:
                        return BOTTOM_LEFT;
                }
                break;

            case 0:
                switch(y) {
                    case -1:
                        return TOP;
                    case 1:
                        return BOTTOM;
                }
                break;

            case 1:
                switch(y) {
                    case -1:
                        return TOP_RIGHT;
                    case 0:
                        return LEFT;
                    case 1:
                        return BOTTOM_RIGHT;
                }
                break;
        }
    }
};

profiler.registerObject(moveCache, "moveCache");
global.moveCache = moveCache;