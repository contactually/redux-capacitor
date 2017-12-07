# Redux Capacitor
[![npm version](https://badge.fury.io/js/redux-capacitor.svg)](https://badge.fury.io/js/redux-capacitor)
[![codecov](https://codecov.io/gh/contactually/redux-capacitor/branch/master/graph/badge.svg)](https://codecov.io/gh/contactually/redux-capacitor)

> We need a cool logo

## Installation

```
yarn add redux-capacitor
```

## Contributing

### Setup

After cloning the repo, be sure to install the pre-commit hook:

```
yarn hook
```

### Making Changes Locally

Developing locally is easy using `yarn publish:local`.

*NOTE*: Before starting, install `yalc` with `npm i -g yalc`.

To get started:

1) *In this repo* Publish this app locally using `yarn publish:local`
2) *In your project repo* Link the local version to your project using `yalc add redux-capacitor`
3) *In this repo* Whenever you make changes, run `yarn publish:local` to push the changes to your project.

For example:
```
# Be sure that yalc is installed globally! (npm i -g yalc)
# Step 1
$ pwd
# => ~/Projects/entities
$ yarn publish:local
# => redux-capacitor@0.4.0-efe9eda8 published in store.

# Step 2
$ cd ~/Projects/my-project
$ yalc add redux-capacitor
# => redux-capacitor@0.4.0-822024a8 locted ==> ~/Projects/my-project/node_modules/redux-capacitor

# Step 3
$ cd ~/Projects/entities
# make some changes...
$ yarn publish:local
# make some more changes...
$ yarn publish:local
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
yarn publish:npm
```

## Contributors

Originally written by @jcarbo and @apiv for @Contactually.

Iterative improvements and maintenance is continued by @apiv and the @Contactually team.
