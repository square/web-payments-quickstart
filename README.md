# tpl-oss-js

[![LICENSE](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://github.com/square/tpl-oss-js/blob/main/LICENSE)

Template for new JavaScript open source projects. [Learn how to create your new repository](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).

## What's included

This template includes some basics for starting a new JavaScript project to help you save time and effort. It has some opinions, but not many.

- [x] Documentation: README, LICENSE, Code of Conduct, Contributing, Security, Support
- [x] GitHub templates for Issues and Pull Requests with code owners
- [x] Bootstrapped `package.json` and `index.js`
- [x] Linting via ESLint and Prettier
- [x] Pre-commit hooks
- [x] GitHub Actions CI workflow
- [ ] Test framework (e.g. runner, code coverage, etc.)
- [ ] Build tools (e.g. TypeScript, esbuild, webpack, etc.)
- [ ] Conventional Commits or commit linting
- [ ] Semantic Releases or other package management workflows

## Launching

[Your pre-launch checklist](https://opensource.guide/starting-a-project/#your-pre-launch-checklist) and more on [Open Source Guides](https://opensource.guide/)

### Resources for better READMEs

- [Make a README](https://www.makeareadme.com/)
- [Making READMEs Readable](https://github.com/18F/open-source-guide/blob/18f-pages/pages/making-readmes-readable.md)
- [README Template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)

---

## Development

### Getting Started

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
