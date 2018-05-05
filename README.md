# make-watch

[![Build Status](https://travis-ci.org/mbasso/make-watch.svg?branch=master)](https://travis-ci.org/mbasso/make-watch)
[![npm version](https://img.shields.io/npm/v/make-watch.svg)](https://www.npmjs.com/package/make-watch)
[![npm downloads](https://img.shields.io/npm/dm/make-watch.svg?maxAge=2592000)](https://www.npmjs.com/package/make-watch)
[![MIT](https://img.shields.io/npm/l/make-watch.svg)](https://github.com/mbasso/make-watch/blob/master/LICENSE.md)

> Continuously run Make in watch mode

---

**Attention - This project isn't completed yet. Feel free to contribute with code, tests or documentation.**
---

---

## Motivation

Sometimes while developing we want to recompile a file or rerun all tests when something changes. `make-watch` allows you to run a `make` command automatically everytime that one of its dependency changes. How? `make-watch` analyzes your `Makefile` and extracts a dependency graph, so it can watch all and only the interested files. You no longer need to manually run commands if you change a file or the `Makefile` itself.

## Installation

You can install make-watch using [npm](https://www.npmjs.com/package/make-watch):

```bash
npm install --save-dev make-watch
```

or, if you prefer, you can install make-watch globally with:

```bash
npm install -g make-watch
```

## Usage

Once you have installed make-watch, you can use it from the command line. Just replace `make` with `make-watch`. Here is an example:

```bash
# make
make-watch

# make target1.exe target2.exe
make-watch target1.exe target2.exe

# make target1.exe target2.exe
# also watch .cpp files in src and lib dir except config.cpp
# this is useful if you want to recompile your app
# when you create a new file for example
make-watch target1.exe target2.exe -I "src","lib" -x ".cpp" -i "config.cpp"
```

## Options

| Option   | Default       | Description  |
|----------|---------------|--------------|
| -V, --version |          | output the version number |
| -I, --include \<files_and_dirs> | | list of additional files and directoris to watch |
| -x, --extensions \<extensions> | | list of extensions to hook into |
| -i, --ignore \<regex> | | ignore all additional files and directories that match this regex |
| --no-makewatchrc |  | whether or not to look up .makewatchrc |
| -h, --help | | output usage information |

## makewatchrc

Instead of cli options, you can use a `.makewatchrc` json file, here is an example:

```json
{
  "include": ["src", "lib"],
  "extensions": [".cpp"],
  "ignore": "ignore.cpp"
}
```

make-watch will lookup to a `.makewatchrc` in the current directory. If one does not exist, it will travel up the directory tree trying to find it.

## Change Log

This project adheres to [Semantic Versioning](http://semver.org/).  
Every release, along with the migration instructions, is documented on the Github [Releases](https://github.com/mbasso/make-watch/releases) page.

## Authors
**Matteo Basso**
- [github/mbasso](https://github.com/mbasso)
- [@teo_basso](https://twitter.com/teo_basso)

## Copyright and License
Copyright (c) 2017, Matteo Basso.

make-watch source code is licensed under the [MIT License](https://github.com/mbasso/make-watch/blob/master/LICENSE.md).
