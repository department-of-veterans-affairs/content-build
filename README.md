# VA.gov Content Build [![Build Status](https://dev.vets.gov/jenkins/buildStatus/icon?job=testing/content-build/master)](http://jenkins.vetsgov-internal/job/testing/job/content-build/job/master/)

## What is this?

This repository contains scripts and templates which generate static HTML pages for the VA.gov site.

There are several repositories that contain the code and content used to build VA.gov. If you're looking to get started running VA.gov locally, you should read the [Getting Started](https://department-of-veterans-affairs.github.io/veteran-facing-services-tools/getting-started) documentation.

## Common commands

Once you have the site set up locally, these are some common commands you might find useful:

| I want to...                                  | Then you should...                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| fetch all dependencies                        | `yarn install`. Run this any time `package.json` changes                     |
| build static HTML pages                       | `yarn build`                                                                 |
| run the dev server                            | `yarn watch`. Uses port 3002, keeping 3001 free for vets-website dev server  |

### Building static content

VA.gov contains many pages that include content generated from a Drupal-based content model.
When testing changes to static pages, or to see what your application looks like
on VA.gov, you'll need to build these static pages using the following commands:

`yarn build` (`—-pull-drupal` runs by default when cache is empty)

- needs active socks proxy connection
- creates symlink to `../vets-website/build/localhost/generated` by default, allowing access to app bundles (use `--apps-directory-name` to change the default apps directory name; e.g. `--apps-directory-name application`)
- run once to pull and cache the latest Drupal content and build the static HTML files
- need to run this again when adding new templates based on new Drupal entities (use `--pull-drupal` to fetch fresh content)

`yarn watch`

- watches for changes to liquid templates

`yarn preview`

- You can run this concurrently with `yarn watch`. It adds local routes needed to preview Drupal nodes
  (e.g. `/preview?nodeId=XX`).

If you do not have access to the SOCKS proxy, you can **fetch the latest cached version
of the content** with the following:

```sh
yarn fetch-drupal-cache
```
## Running tests

### Unit tests

To **run all unit tests,** use:

```sh
yarn test:unit
```

If you want to **run only one test file**, you can provide the path to it:

```sh
yarn test:unit src/site/filters/liquid.unit.spec.js
```

To **run all tests in a directory**, you can use a glob pattern:

```sh
yarn test:unit src/site/filters/**/*.spec.js
```

## More commands

After a while, you may run into a less common task. We have a lot of commands
for doing very specific things.

| I want to...                                                                                                | Then you should...                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| build the production site (dev features disabled).                                                          | `NODE_ENV=production yarn build --buildtype vagovprod`                                                                                                                                                                       |
| fetch the latest content cache from S3                                                                      | `yarn fetch-drupal-cache` (does not require SOCKS proxy access)                                                                                                                                                              |
| reset local environment (clean out node modules and runs npm install)                                       | `yarn reset:env`                                                                                                                                                                                                             |
| run the site so that devices on your local network can access it                                            | `yarn watch --env.host 0.0.0.0 --env.public 198.162.x.x:3001` Note that we use CORS to limit what hosts can access different APIs, so accessing with a `192.168.x.x` address may run into problems                           |
| run all unit tests and watch                                                                                | `yarn test:watch`                                                                                                                                                                                                            |
| run only e2e tests                                                                                          | Make sure the site is running locally (`yarn watch`) and run the tests with `yarn test:e2e`                                                                                                                                  |
| run e2e tests in headless mode                                                                              | `yarn test:e2e:headless`                                                                                                                                                                                                     |
| run all linters                                                                                             | `yarn lint`                                                                                                                                                                                                                  |
| run only javascript linter                                                                                  | `yarn lint:js`                                                                                                                                                                                                               |
| run lint on JS and fix anything that changed                                                                | `yarn lint:js:changed:fix`                                                                                                                                                                                                   |
| run automated accessibility tests                                                                           | `yarn build && yarn test:accessibility`                                                                                                                                                                                      |
| run visual regression testing                                                                               | Start the site. Generate your baseline image set using `yarn test:visual:baseline`. Make your changes. Then run `yarn test:visual`.                                                                                          |
| test for broken links                                                                                       | Build the site. Broken Link Checking is done via a Metalsmith plugin during build. Note that it only runs on _build_ not watch.                                                                                              |
| add new npm modules                                                                                         | `yarn add my-module`. Use the `--dev` flag for modules that are build or test related.                                                                                                                                       |
| get the latest json schema                                                                                  | `yarn update:schema`. This updates our [vets-json-schema](https://github.com/department-of-veterans-affairs/vets-json-schema) vets-json-schema https://github.com/department-of-veterans-affairs/ to the most recent commit. |
| check test coverage                                                                                         | `yarn test:coverage`                                                                                                                                                                                                         |

## Supported Browsers

| Browser                   | Minimum version | Note                                   |
| ------------------------- | --------------- | -------------------------------------- |
| Internet Explorer         | 11              |                                        |
| Microsoft Edge            | 13              |                                        |
| Safari / iOS Safari       | 9               |                                        |
| Chrome / Android Web view | 44              | _Latest version with >0.5% of traffic_ |
| Firefox                   | 52              | _Latest version with >0.5% of traffic_ |
