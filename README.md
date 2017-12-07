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

Developing locally is easy using `yarn publish:local`.

*NOTE*: Before starting, install `yalc` with `npm i -g yalc`.

To get started:

1) *In this repo* Publish this app locally using `yarn publish:local`
2) *In your project repo* Link the local version to your project using `yalc add @contactually/entities`
3) *In this repo* Whenever you make changes, run `yarn publish:local` to push the changes to your project.

For example:
```
# Be sure that yalc is installed globally! (npm i -g yalc)
# Step 1
$ pwd
# => ~/Projects/entities
$ yarn publish:local
# => @contactually/entities@0.4.0-efe9eda8 published in store.

# Step 2
$ cd ~/Projects/my-project
$ yalc add @contactually/entities
# => @contactually/entities@0.4.0-822024a8 locted ==> ~/Projects/my-project/node_modules/@contactually/entities

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
