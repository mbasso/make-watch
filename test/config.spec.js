import buildConfig from '../src/config';

describe('config', () => {
  let processCwd;

  beforeAll(() => {
    processCwd = process.cwd;
  });

  afterAll(() => {
    process.cwd = processCwd;
  });

  test('should support include and extensions', () => {
    expect(
      () => buildConfig({
        include: ['src'],
        extensions: ['.cpp'],
      }),
    ).not.toThrow();
  });

  test('should throw if an unexisting path is provided in include', () => {
    expect(
      () => buildConfig({
        include: ['foo'],
      }),
    ).toThrow('file or directory "foo" does not exists');
  });

  test('should throw if a malformed extension is provided in extensions', () => {
    expect(
      () => buildConfig({
        extensions: ['cpp'],
      }),
    ).toThrow('extension "cpp" does not match the extension format');
  });

  test('should get default config if no command line options and no makewatchrc are provided', () => {
    const config = buildConfig({});
    expect(config).toEqual({
      include: [],
      extensions: undefined,
      ignore: undefined,
      makewatchrc: true,
    });
  });

  test('should get default config if program is not provided', () => {
    const config = buildConfig();
    expect(config).toEqual({
      include: [],
      extensions: undefined,
      ignore: undefined,
      makewatchrc: true,
    });
  });

  test('should get config from command line', () => {
    const config = buildConfig({
      makewatchrc: false,
    });
    expect(config.makewatchrc).toEqual(false);
  });

  test('should get config from makewatchrc', () => {
    process.cwd = () => './test';
    const config = buildConfig({});
    expect(config.ignore).toEqual('foo');
  });

  test('should get config from makewatchrc in parent folder', () => {
    process.cwd = () => './test/files';
    const config = buildConfig({});
    expect(config.ignore).toEqual('foo');
  });

  test('should overwrite makewatchrc config from command line', () => {
    process.cwd = () => './test';
    const config = buildConfig({
      ignore: 'bar',
    });
    expect(config.ignore).toEqual('bar');
  });
});
