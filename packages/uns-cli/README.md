# uns-cli

uns CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/uns-cli.svg)](https://npmjs.org/package/@uns/uns-cli)
[![Downloads/week](https://img.shields.io/npm/dw/uns-cli.svg)](https://npmjs.org/package/@uns/uns-cli)

<!-- toc -->

-   [uns-cli](#uns-cli)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Release publish](#release-publish)

<!-- tocstop -->

# Install

-   via npm

```
$ npm install -g @uns/uns-cli
```

-   via yarn

```
yarn global add @uns/uns-cli
```

🤖 _Tested with Ubuntu 18.04 and macOS Mojave_

# Usage

<!-- usage -->

```sh-session
$ uns COMMAND
running command...
$ uns (-v|--version|version)
@uns/uns-cli/0.0.0 linux-x64 node-v8.11.1
$ uns --help [COMMAND]
USAGE
  $ uns COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

-   [`uns hello [FILE]`](#uns-hello-file)
-   [`uns help [COMMAND]`](#uns-help-command)

## `uns hello [FILE]`

describe the command here

```
USAGE
  $ uns hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ uns hello
  hello world from ./src/hello.ts!
```

## `uns help [COMMAND]`

display help for uns

```
USAGE
  $ uns help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_

<!-- commandsstop -->

# Developers

## Build

```bash
yarn build
```

## Uglify

```bash
yarn uglify
```

## Run locally

```bash
./bin/run COMMAND ...
```

# Release & publish UNS CLI on npm registry

```bash
yarn publishLib
```