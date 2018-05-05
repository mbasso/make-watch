const split = str =>
  (str || '')
    .trim()
    .split(/\s+/)
    .filter(x => x.length > 0);

const flatten = arr => arr.reduce((acc, cur) => acc.concat(cur), []);
const removeDuplicates = arr => arr.filter((item, pos) => arr.indexOf(item) === pos);

const getVariable = (variable, database) => {
  const result = new RegExp(`^\\s*(?!#)\\s*${variable}\\s*:=\\s*(.*)\\s*$`, 'm').exec(database);
  return result && result[1];
};

const getPrerequisites = (target, database, ancestors = []) => {
  let result;
  const targetRegexSource = `\\s*(?!#).*?${target}.*?:($|\\s*.*?\\s*$)`;
  const notTargetRegex = new RegExp(`^# Not a target:\\n${targetRegexSource}`, 'm');
  // eslint-disable-next-line
  if (notTargetRegex.exec(database)) {
    return [target];
  }

  let newPrerequisites = [];
  const targetRegex = new RegExp(`^${targetRegexSource}`, 'm');

  let removeTarget = false;
  let file = database;
  // eslint-disable-next-line
  while (result = targetRegex.exec(file)) {
    removeTarget = true;
    const [match, targetPrerequisites] = result;
    newPrerequisites = [...newPrerequisites, ...split(targetPrerequisites)];
    file = file.replace(match, '');
  }

  newPrerequisites = removeDuplicates(newPrerequisites)
    .filter(x => x !== '|' && ancestors.indexOf(x) === -1);
  const dependencies = removeDuplicates(
    flatten(
      newPrerequisites.map(x => getPrerequisites(x, database, [...ancestors, target])),
    ),
  );

  if (dependencies.length > 0) return dependencies;
  if (removeTarget || ancestors.length === 0) return [];
  return [target];
};

export default function getTargets(database) {
  let goals = getVariable('MAKECMDGOALS', database);
  if (!goals) {
    goals = getVariable('.DEFAULT_GOAL', database);
  }

  goals = split(goals);

  return removeDuplicates([
    ...flatten(goals.map(target => getPrerequisites(target, database))),
    ...split(getVariable('MAKEFILE_LIST', database) || ''),
  ]);
}
