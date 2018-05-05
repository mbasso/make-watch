import chalk from 'chalk';
import getStream from 'get-stream';
import childProcess from 'child_process';

const noop = () => {};

const print = ({ color, message, type = 'log' }) => {
  // eslint-disable-next-line
  console[type](chalk.bold[color](message));
};

const error = message =>
  print({
    color: 'red',
    message,
    type: 'error',
  });

const success = message =>
  print({
    color: 'green',
    message,
  });

export const optionToArray = (val = '') =>
  val.split(',')
    .map(x => String(x).replace(/(?:(^")|("$))/g, ''))
    .filter(x => x !== '');

export const exit = ({ code = 0, message = '' } = {}) => {
  if (message) {
    const text = `\n\t${message}\n`;
    if (code === 0) {
      success(text);
    } else {
      error(text);
    }
  }
  process.exit(code);
};

export const execCli = (command, args = [], cb = noop) => {
  let child;
  let stdout;
  let stderr;

  const processPromise = new Promise((resolve) => {
    child = childProcess.spawn(command, args, {
      stdio: [null, 'pipe', 'pipe'],
    });

    child.on('close', (code, signal) => {
      if (code) {
        const err = new Error(code);
        err.code = code;
        err.signal = signal;
        resolve(err);
        return;
      }

      resolve(code);
    });

    stdout = getStream(child.stdout);
    stderr = getStream(child.stderr);
  });

  Promise.all([processPromise, stdout, stderr]).then((res) => {
    cb(...res);
  });

  return child;
};
