require("imports");

const memoryManagement = require("memorymanagement");
const aiRunner = require("airunner");

const PROFILER_ENABLED = false;

module.exports.loop = function () {
    if (PROFILER_ENABLED) {
        profiler.enable();
        profiler.wrap(gameLoop())
    } else {
        gameLoop();
    }

};

const gameLoop = function() {
    memoryManagement.run();
    aiRunner.run();
};