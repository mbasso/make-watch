import chalk from 'chalk';
import { exit, optionToArray, execCli } from '../src/utils';

const versionRegex = /\d+\.\d+\.\d+/;

describe('utils', () => {
  describe('exit', () => {
    let originalExit;

    beforeAll(() => {
      originalExit = process.exit;
      process.exit = () => {};
    });

    afterAll(() => {
      process.exit = originalExit;
    });

    test('should exit with code 0 and without message by default', () => {
      const logSpy = jest.spyOn(console, 'log');
      const exitSpy = jest.spyOn(process, 'exit');
      exit();
      expect(logSpy).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with code 0 by default', () => {
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        message: 'foo',
      });
      expect(exitSpy).toHaveBeenCalledWith(0);
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit without message by default', () => {
      const logSpy = jest.spyOn(console, 'log');
      exit({
        code: 0,
      });
      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockReset();
      logSpy.mockRestore();
    });

    test('should exit with the given code', () => {
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 1,
      });
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with success message', () => {
      const logSpy = jest.spyOn(console, 'log');
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 0,
        message: 'bar',
      });
      expect(logSpy).toHaveBeenCalledWith(chalk.bold.green('\n\tbar\n'));
      expect(exitSpy).toHaveBeenCalledWith(0);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with error message', () => {
      const logSpy = jest.spyOn(console, 'error');
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 1,
        message: 'baz',
      });
      expect(logSpy).toHaveBeenCalledWith(chalk.bold.red('\n\tbaz\n'));
      expect(exitSpy).toHaveBeenCalledWith(1);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });
  });

  describe('optionToArray', () => {
    test('should handle empty string', () => {
      expect(
        optionToArray(''),
      ).toEqual([]);
    });

    test('should handle undefined value', () => {
      expect(
        optionToArray(),
      ).toEqual([]);
    });

    test('should handle single value', () => {
      expect(
        optionToArray('"src"'),
      ).toEqual(['src']);
    });

    test('should handle multiple values', () => {
      expect(
        optionToArray('"src","test"'),
      ).toEqual(['src', 'test']);
    });
  });

  describe('execCli', () => {
    test('should return a child process', () => {
      const childProcess = execCli('npm');
      expect(childProcess.stdout).toBeTruthy();
      expect(childProcess.stderr).toBeTruthy();
    });

    test('should run the given command', (done) => {
      const childProcess = execCli('npm');
      childProcess.on('exit', () => done());
      childProcess.on('error', () => done());
      childProcess.on('disconnect', () => done());
      childProcess.on('close', () => done());
    });

    test('should run the given command with args', (done) => {
      const childProcess = execCli('npm', ['-v']);
      childProcess.stdout.on('data', (data) => {
        expect(
          versionRegex.test(data.toString()),
        ).toBeTruthy();
        done();
      });
    });

    test('should call the given callback without errors', (done) => {
      execCli('npm', ['-v'], (err) => {
        expect(err).toEqual(0);
        done();
      });
    });

    test('should call the given callback with error', (done) => {
      execCli('npm', [], (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.code).toEqual(1);
        done();
      });
    });

    test('should call callback with stdout', (done) => {
      execCli('npm', ['-v'], (err, stdout) => {
        expect(
          versionRegex.test(stdout),
        ).toBeTruthy();
        done();
      });
    });

    test('should call callback with stderr', (done) => {
      execCli('npm', [], (err, stdout, stderr) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.code).toEqual(1);
        expect(typeof stderr).toEqual('string');
        done();
      });
    });
  });
});
