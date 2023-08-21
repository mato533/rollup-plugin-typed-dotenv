# rollup-plugin-typed-dotenv

[![npm version](https://badge.fury.io/js/rollup-plugin-typed-dotenv.svg)](https://badge.fury.io/js/rollup-plugin-typed-dotenv)
[![CI/CD](https://github.com/mato533/rollup-plugin-typed-dotenv/actions/workflows/cicd.yml/badge.svg)](https://github.com/mato533/rollup-plugin-typed-dotenv/actions/workflows/cicd.yml)
[![codecov](https://codecov.io/gh/mato533/rollup-plugin-typed-dotenv/branch/main/graph/badge.svg?token=50Z04K2PVN)](https://codecov.io/gh/mato533/rollup-plugin-typed-dotenv)
[![CodeFactor](https://www.codefactor.io/repository/github/mato533/rollup-plugin-typed-dotenv/badge)](https://www.codefactor.io/repository/github/mato533/rollup-plugin-typed-dotenv)
[![GitHub](https://img.shields.io/github/license/mato533/rollup-plugin-typed-dotenv)](https://github.com/mato533/rollup-plugin-typed-dotenv/blob/main/LICENSE)

## About

Rollup plugin of dotenv

### Detail

When this plug-in replaces code with environment variables, it converts to an appropriate form (for String, enclose it in double quotes, etc.) according to the plugin settings.

### Sample of the source code

#### BEFORE

```js
// main.js
console.log(process.env.ROLLUP_VALUE_STRING);
console.log(process.env.ROLLUP_VALUE_NUMBER);
console.log(process.env.ROLLUP_VALUE_FALSE);
```

```
#.env
ROLLUP_VALUE_STRING=Test value
ROLLUP_VALUE_NUMBER=2
ROLLUP_VALUE_FALSE=FALSE
```

#### AFTER

```js
// main.js
console.log('Test value');
console.log(2);
console.log(false);
```

## Installation

1. NPM

   ```sh
   npm install -D rollup-plugin-typed-dotenv
   ```

1. Yarn
   ```sh
   yarn add -D rollup-plugin-typed-dotenv
   ```

## Usage

### Options

#### `envDir`

Type:`string`  
Default: `process.cwd()`  
directory in which to search for env files.

#### `envPrefix`

Type:`string`  
Default: `ROLLUP_`  
Only enviroment valiable which has this prefix is exposed to javascript code.

#### `envKey`

Type:`string`  
Default: `NODE_ENV`  
Key used to search for .env files for environment in which an application is running

#### `preventAssignment`

See document of rollup-plugin-replace

#### `values`

define type of environment valiables

```js
{
  ROLLUP_VALUE_STRING: 'string',
  ROLLUP_VALUE_NUMBER: 'number',
  ROLLUP_VALUE_FALSE: 'boolean',
}
```

##### Supported types

- string
- number
- boolean
