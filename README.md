# Web Payments Quickstart

[![LICENSE](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://github.com/square/tpl-oss-js/blob/main/LICENSE)
[![CI](https://github.com/square/web-payments-quickstart/actions/workflows/ci.yml/badge.svg)](https://github.com/square/web-payments-quickstart/actions/workflows/ci.yml)

Quickstart for using Square's Web Payments SDK

## Getting Started

Start by [cloning](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) this repository.

```sh
git clone https://github.com/square/web-payments-quickstart
cd web-payments-quickstart
```

Install dependencies using an [active version](https://nodejs.org/en/about/releases/) of Node.js which will include `npm`.

```sh
npm install
```

Run the development server.

```sh
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000).

### Credentials

Before you can take a payment, you'll need to configure your developer credentials which can be found in the [Developer Dashboard](https://developer.squareup.com/apps).

Copy `.env.example`to `.env.sandbox`

```sh
cp .env.example .env.sandbox
```

Define `SQUARE_ACCESS_TOKEN` with your **Sandbox** Access Token from the Developer Dashboard.

```ini
SQUARE_ACCESS_TOKEN=eX@mpl3_t0k3n
```

Restart your server to use this new value.

_Remember: Do not add your access tokens to git!_

## Development

### Setup

When contributing to this project, you'll want to use Node v15 as defined by `.nvmrc` to take advantage of npm@7. You can use [nvm](https://github.com/nvm-sh/nvm) to install the correct version:

```sh
nvm install $(cat .nvmrc)
```

Follow the "Getting Started" instructions above to install dependencies and verify your local server starts properly.

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
