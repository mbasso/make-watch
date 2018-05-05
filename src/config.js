import fs from 'fs';
import path from 'path';

const defaultConfig = {
  include: [],
  extensions: undefined,
  ignore: undefined,
  makewatchrc: true,
};

const getMakewatchrc = (dir) => {
  const makewatchrcPath = path.join(dir, '.makewatchrc');
  if (fs.existsSync(makewatchrcPath)) {
    return JSON.parse(fs.readFileSync(makewatchrcPath, 'utf8'));
  }
  const parent = path.resolve(dir, '../');
  return dir !== parent ? getMakewatchrc(path.resolve(dir, '../')) : {};
};

const mergeConfig = (config1, config2) => {
  const config = {};
  Object.keys(defaultConfig).forEach((key) => {
    if (config2[key] !== undefined) {
      config[key] = config2[key];
    }
  });
  return Object.assign({}, config1, config);
};

export default function buildConfig(program = {}) {
  let config = { ...defaultConfig };

  if ((program.makewatchrc || program.makewatchrc === undefined)) {
    config = mergeConfig(config, getMakewatchrc(process.cwd()));
  }

  config = mergeConfig(config, program);

  if (config.extensions !== undefined) {
    config.extensions.forEach((ext) => {
      if (!/^\.[a-zA-Z_][a-zA-Z0-9_]*/.test(ext)) {
        throw new Error(`extension "${ext}" does not match the extension format`);
      }
    });
  }

  config.include.forEach((include) => {
    if (!fs.existsSync(include)) {
      throw new Error(`file or directory "${include}" does not exists`);
    }
  });

  return config;
}
