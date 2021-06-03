/* eslint-disable no-console */

const Metalsmith = require('metalsmith');
const chalk = require('chalk');
const AsciiTable = require('ascii-table');

const {
  overloadConsoleWrites,
  isConsoleDirty,
  cleanConsole,
} = require('./console');

const GARBAGE_COLLECTION_FREQUENCY_SECONDS = 10;
let garbageCollectionInterval;
let peakRSSUsed = 0;

const formatMemory = m => Math.round((m / 1024 / 1024) * 100) / 100;

const printGarbageCollectionStats = (memBefore, memAfter) => {
  const getDiff = stat => formatMemory(memBefore[stat] - memAfter[stat]);
  const getMsg = stat =>
    `${stat}: ${formatMemory(memAfter[stat])}mB (${getDiff(stat)}mB collected)`;
  if (memBefore.rss > peakRSSUsed) peakRSSUsed = memBefore.rss;

  console.log(`\n[MANUAL GC] ${getMsg('heapUsed')} ${getMsg('rss')}\n`);
};

const logMemoryUsage = (heapUsedStart, heapUsedEnd, rssStart, rssEnd) => {
  console.log(
    chalk.bold('Starting memory:'),
    `${formatMemory(heapUsedStart)}mB heap, ${formatMemory(rssStart)}mB rss`,
  );
  console.log(
    chalk.bold('Ending memory:'),
    `${formatMemory(heapUsedEnd)}mB heap, ${formatMemory(rssEnd)}mB rss`,
  );
  console.log(
    chalk.bold('Deltas:'),
    `${formatMemory(heapUsedEnd - heapUsedStart)}mB heap, ` +
      `${formatMemory(rssEnd - rssStart)}mB rss`,
  );
};

/**
 * It's Metalsmith with some added shine.
 */
module.exports = () => {
  const smith = Metalsmith(__dirname);
  overloadConsoleWrites();

  smith.stepStats = [];
  let stepCount = 0;
  let lastLogLineLength = 0;

  const logStepStart = (step, description) => {
    const logLine = `\nStep ${step + 1} of ${stepCount} start: ${description}`;
    console.log(chalk.cyan(logLine));
    lastLogLineLength = logLine.length % process.stdout.columns;
    cleanConsole();
  };

  const logStepEnd = (step, description, timeElapsed) => {
    // Color the time
    let color;
    if (timeElapsed < 1000) color = chalk.green;
    else if (timeElapsed < 10000) color = chalk.yellow;
    else color = chalk.red;
    const coloredTime = color(`[${timeElapsed}ms]`);

    if (process.stdout.isTTY && !global.verbose && !isConsoleDirty()) {
      // Just append the logStepStart line with the time elapsed
      process.stdout.cursorTo(lastLogLineLength, process.stdout.rows - 2);
      process.stdout.write(`${coloredTime}`);
      // If we added another cursorTo(0, process.stdout.rows), it creates
      // a blank line between the two logStepStart lines
      if (step + 1 === stepCount) {
        // Last step; clean it up with a newline
        process.stdout.write('\n');
      }
    } else {
      // Output to a new line
      console.log(
        chalk.cyan(`Step ${step + 1} end ${coloredTime}: ${description}`),
      );
    }
  };

  // Override the normal use function to log additional information
  smith._use = smith.use;
  smith.use = function use(plugin, description = 'Unknown Plugin') {
    const step = stepCount++;
    smith.stepStats[step] = { description };

    let timerStart;
    let heapUsedStart;
    let rssStart;

    return smith
      ._use(() => {
        heapUsedStart = process.memoryUsage().heapUsed;
        rssStart = process.memoryUsage().rss;
        smith.stepStats[step].memoryStart = heapUsedStart;
        smith.stepStats[step].rssStart = rssStart;
        logStepStart(step, description);
        timerStart = process.hrtime.bigint();
      })
      ._use(plugin)
      ._use(() => {
        const heapUsedEnd = process.memoryUsage().heapUsed;
        const rssEnd = process.memoryUsage().rss;
        smith.stepStats[step].memoryEnd = heapUsedEnd;
        smith.stepStats[step].rssEnd = rssEnd;

        const timeElapsed = (process.hrtime.bigint() - timerStart) / 1000000n;
        smith.stepStats[step].timeElapsed = timeElapsed;

        logStepEnd(step, description, timeElapsed);
        if (global.verbose) {
          logMemoryUsage(heapUsedStart, heapUsedEnd, rssStart, rssEnd);
        }
      });
  };

  smith.startGarbageCollection = function startGarbageCollection() {
    if (global.gc) {
      garbageCollectionInterval = setInterval(() => {
        const memBefore = process.memoryUsage();
        global.gc();
        const memAfter = process.memoryUsage();
        printGarbageCollectionStats(memBefore, memAfter);
      }, GARBAGE_COLLECTION_FREQUENCY_SECONDS * 1000);
    } else {
      throw new Error(
        'Manual garbage collection disabled. Enable with --expose-gc',
      );
    }
  };

  smith.endGarbageCollection = function endGarbageCollection() {
    clearInterval(garbageCollectionInterval);
  };

  smith.printPeakMemory = function printPeakMemory() {
    console.log(`\nPeak RSS used: ${formatMemory(peakRSSUsed)}mB\n`);
  };

  smith.printSummary = function printSummary() {
    const truncate = input =>
      input.length > 55 ? `${input.substring(0, 55)}...` : input;

    const table = new AsciiTable('Step summary');
    table.setHeading(
      'Step',
      'Description',
      'Time Elapsed',
      'Heap Change',
      'Total Heap',
      'RSS Change',
      'Total RSS',
    );
    smith.stepStats.forEach((stats, index) =>
      table.addRow(
        index,
        truncate(stats.description),
        `${stats.timeElapsed}ms`,
        `${formatMemory(stats.memoryEnd - stats.memoryStart)}mB`,
        `${formatMemory(stats.memoryEnd)}mB`,
        `${formatMemory(stats.rssEnd - stats.rssStart)}mB`,
        `${formatMemory(stats.rssEnd)}mB`,
      ),
    );

    table.removeBorder();
    console.log(table.toString());
  };

  return smith;
};
