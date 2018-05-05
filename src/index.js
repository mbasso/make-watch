#!/usr/bin/env node
import fs from 'fs';
import program from 'commander';
import chokidar from 'chokidar';
import getConfig from './config';
import getTargets from './parser';
import { optionToArray, execCli, exit } from './utils';
import { version } from '../package.json';

let targets = [];

program
  .version(version)
  .arguments('[targets...]')
  .option(
    '-x, --extensions <extensions>',
    'list of extensions to hook into',
    optionToArray,
  )
  .option(
    '-I, --include <files_and_dirs>',
    'list of additional files and directoris to watch',
    optionToArray,
  )
  .option(
    '-i, --ignore <regex>',
    'ignore all additional files and directories that match this regex',
  )
  .option('--no-makewatchrc', 'whether or not to look up .makewatchrc')
  .action((args) => {
    if (args) {
      targets = [...targets, ...args];
    }
  })
  .parse(process.argv);

const config = getConfig(program);

// eslint-disable-next-line
console.log('\n');

const watcher =
  chokidar
    .watch(config.include, {
      persistent: true,
      ignoreInitial: true,
    });

let childProcess;
let dependencies = [];

const runMake = (path) => {
  if (
    // ignore files and dirs accordingly to additional settings
    !dependencies.some(dep => dep.indexOf(path) === dep.length - path.length) &&
    (!config.extensions ||
        (fs.lstatSync(path).isFile() &&
        config.extensions.some(ext => path.indexOf(ext) === path.length - ext.length))
    ) &&
    (!config.ignore || new RegExp(config.ignore).test(path))
  ) return;

  if (childProcess) {
    childProcess.kill('SIGINT');
  }

  // https://www.gnu.org/software/make/manual/html_node/Options-Summary.html
  // -q, --question
  // “Question mode”. Do not run any recipes, or print anything;
  // just return an exit status that is zero if the specified targets are already up to date,
  // one if any remaking is required, or two if an error is encountered.
  childProcess = execCli('make', ['-qp', ...targets], (err, stdout, stderr) => {
    if (err && err.code === 2) {
      childProcess = undefined;
      // eslint-disable-next-line
      console.error(stderr);
    } else {
      const currentDependencies = getTargets(stdout);
      dependencies.forEach((dep) => {
        if (currentDependencies.indexOf(dep) === -1) {
          watcher.unwatch(dep);
        }
      });
      currentDependencies.forEach((dep) => {
        if (dependencies.indexOf(dep) === -1 && fs.existsSync(dep) && fs.lstatSync(dep).isFile()) {
          watcher.add(dep);
        }
      });
      dependencies = currentDependencies;

      if (err && err.code === 1) {
        // eslint-disable-next-line
        console.log(`make ${targets.join(' ')}`);
        childProcess = execCli('make', targets, (error) => {
          childProcess = undefined;
          if (!error) {
            // eslint-disable-next-line
            console.log('\nMake executed successfully\n\nWatching for changes...');
          }
        });

        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
      } else {
        childProcess = undefined;
        // eslint-disable-next-line
        console.log('\nWatching for changes...');
      }
    }
  });
};

watcher
  .on('add', runMake)
  .on('addDir', runMake)
  .on('change', runMake)
  .on('unlink', runMake)
  .on('unlinkDir', runMake)
  .on('error', (error) => {
    exit({
      code: 1,
      message: error,
    });
  });

runMake();
