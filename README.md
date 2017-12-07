# Entities
> We need a better name

## Installation

```
yarn add @contactually/entities
```

## Contributing

### Setup

After cloning the repo, be sure to install the pre-commit hook:

```
yarn hook
```

### Making Changes Locally

Developing locally is easy using `npm link`. To get started:

1) In this project, run `yarn build`.
2) In this project, cd into the `lib/` directory and run `yarn link`
2) In the project which has `@contactually/entities` as a dependency, run `yarn link @contactually/entities`
3) That's it! Make changes in the `src` directory, and run `yarn build` to build the local files.
   - _You must run_ `yarn build` _whenever you make changes in order for them to be visible in your other project._
4) When you are done and no longer want to serve your local build, you can unlink by running `yarn unlink @contactually/entities` in your other project.

For example:
```
$ pwd
# => ~/Projects/entities
$ yarn install
$ yarn build
$ cd lib/
$ yarn link
# => success Registered "@contactually/entities".
# now link the local entities repo to your project
$ cd ~/Projects/my-project
$ yarn link @contactually/entities
# => Using linked module for "@contactually/entities".
```

### Testing

The unit test suite runs with Jest. Run it with:

```
yarn test
```

**Note**: the test suite runs against the diff in the pre-commit hook.

## Publishing

Can only be published by the *contactually* npm user. Log in as this user, and then run:

```
yarn publish
```
