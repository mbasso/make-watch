import fs from 'fs';
import path from 'path';
import getTargets from '../src/parser';

const readFile = fileName =>
  fs.readFileSync(path.join(__dirname, 'files', fileName), 'utf8');

describe('parser', () => {
  test('should use cmd goals if provided', () => {
    expect(
      getTargets(readFile('cmdgoals')),
    ).toEqual(['foo']);
  });

  test('should use default goal', () => {
    expect(
      getTargets(readFile('defaultgoal')),
    ).toEqual(['foo']);
  });

  test('should support multiple goals', () => {
    expect(
      getTargets(readFile('multiplegoals')),
    ).toEqual(['foo', 'bar']);
  });

  test('should add Makefile itself to targets', () => {
    expect(
      getTargets(readFile('makefilelist')),
    ).toEqual(['Makefile']);
  });

  test('should remove duplicates', () => {
    expect(
      getTargets(readFile('removeduplicates')),
    ).toEqual(['foo']);
  });

  test('should support empty prerequisites', () => {
    expect(
      getTargets(readFile('emptyprerequisites')),
    ).toEqual(['foo']);
  });

  test('should support single prerequisite', () => {
    expect(
      getTargets(readFile('singleprerequisite')),
    ).toEqual(['foo']);
  });

  test('should support multiple prerequisites', () => {
    expect(
      getTargets(readFile('multipleprerequisites')),
    ).toEqual(['foo', 'bar']);
  });

  test('should merge multiple prerequisites', () => {
    expect(
      getTargets(readFile('mergeprerequisites')),
    ).toEqual(['foo', 'bar', 'baz', 'lorem']);
  });

  test('should support multiple prerequisites', () => {
    expect(
      getTargets(readFile('multipleprerequisites')),
    ).toEqual(['foo', 'bar']);
  });

  test('should get prerequisites with multiple targets', () => {
    expect(
      getTargets(readFile('prerequisitesmultipletargets')),
    ).toEqual(['foo']);
  });

  test('should be case sensitive', () => {
    expect(
      getTargets(readFile('casesensitive')),
    ).toEqual([]);
  });

  test('should ignore commented variables', () => {
    expect(
      getTargets(readFile('commentedvariables')),
    ).toEqual(['foo']);
  });

  test('should ignore commented rules', () => {
    expect(
      getTargets(readFile('commentedrules')),
    ).toEqual([]);
  });

  test('should remove pipe from prerequisites', () => {
    expect(
      getTargets(readFile('removepipe')),
    ).toEqual(['foo', 'bar']);
  });

  test('should stop with recursive prerequisites', () => {
    expect(
      getTargets(readFile('recursiveprerequisites')),
    ).toEqual(['baz']);
  });

  test('should remove intermediate prerequisites', () => {
    expect(
      getTargets(readFile('removeintermediate')),
    ).toEqual(['baz']);
  });

  test('should get not a target', () => {
    expect(
      getTargets(readFile('notatarget')),
    ).toEqual(['foo']);
  });
});
