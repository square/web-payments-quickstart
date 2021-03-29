# Web Payments Quickstart

[![LICENSE](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://github.com/square/tpl-oss-js/blob/main/LICENSE)
[![CI](https://github.com/square/web-payments-quickstart/actions/workflows/ci.yml/badge.svg)](https://github.com/square/web-payments-quickstart/actions/workflows/ci.yml)

Quickstart for using Square's Web Payments SDK

## Getting Started

```sh
# clone this repository from GitHub
git clone https://github.com/square/web-payments-quickstart
# enter project
cd web-payments-quickstart
# install the correct Node version
nvm install
# use that Node version
nvm use
# install dependencies
npm install
# start development server
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000)

## Development

### Setup

This project uses Node v15 as defined by `.nvmrc` to take advantage of npm@7. You can use [nvm](https://github.com/nvm-sh/nvm) to install the correct version:

```sh
nvm install $(cat .nvmrc)
```

Install dependencies with [npm](https://docs.npmjs.com/cli/v7) which should also install git hooks with [husky](https://typicode.github.io/husky/#/).

```sh
npm install
```

_You can verify husky installed correctly by verifying the output of `git config core.hooksPath` is `.husky`. If this didn't work for some reason, you can run `npx husky install`._

### Testing

You can run all linters, tests, and builds like CI with `npm test`.

### Linting

You can run all linters with `npm run lint`.

#### ESLint

[ESLint](https://eslint.org/) analyzes the code to find and fix problems. We use [eslint-plugin-square](https://github.com/square/eslint-plugin-square) for out-of-the-box configuration.

```sh
npm run lint:eslint
```

##### Fixing warnings and errors automatically

ESLint can sometimes fix warnings and errors automatically for you with its [--fix option](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).

```sh
npm run lint:eslint --fix
```

#### Prettier

[Prettier](https://prettier.io/) is an opinionated code formatter. We use [@square/prettier-config](https://github.com/square/prettier-config) for those opinions.

```sh
npm run lint:prettier
```

##### Fixing code style issues

If after running `npm run lint:prettier` you get a warning like, "Code style issues found in the above file(s). Forgot to run Prettier?", you can have Prettier fix them.

```sh
npm run lint:prettier:fix
```

## Continuous Integration

[GitHub Actions](https://docs.github.com/en/actions) is used for our CI/CD workflows. See `.github/workflows` for details.
