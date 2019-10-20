const ai = {
    [ROLE.HARVESTER]:               require('ai.harvester'),
};

const aiRunner = {
    run() {
        for (let name in Game.creeps) {
            // noinspection JSUnfilteredForInLoop
            let creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            this._tryRunCreepLogic(creep);
        }

        this._tryMoveAllCreeps();
    },

    _tryMoveAllCreeps() {
        try {
            moveCache.moveAllCreeps();
        } catch (e) {
            let message = " moveCache.moveAllCreeps -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _tryRunCreepLogic(creep) {
        try {
            this._runCreepLogic(creep);
        } catch (e) {
            let message = creep + " -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _runCreepLogic: function(creep) {
        if (creep.respawnTTL) {
            if (creep.ticksToLive < creep.respawnTTL) {
                creep.addRespawnEntryToSpawnQueue();
            }
        }

        ai[creep.role].run(creep);
    },
};

profiler.registerObject(aiRunner, "aiRunner");
module.exports = aiRunner;