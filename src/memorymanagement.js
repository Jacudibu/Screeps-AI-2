const memorymanagement = {
    run() {
        this.deleteDeadCreeps();
    },

    deleteDeadCreeps() {
        for(const creepName in Memory.creeps) {
            if(Game.creeps[creepName]) {
                continue;
            }

            Cache.deleteCreepCacheOnDeath(creepName);
            delete Memory.creeps[creepName];
        }
    },
};

profiler.registerObject(memorymanagement, "MemoryManagment");
module.exports = memorymanagement;