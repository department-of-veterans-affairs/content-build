# VA.gov Content Build ![Build Status](https://github.com/department-of-veterans-affairs/content-build/actions/workflows/continuous-integration.yml/badge.svg?branch=main)

## What is this?

This repository contains scripts and templates which generate static HTML pages for the VA.gov site.

There are several repositories that contain the code and content used to build VA.gov. If you're looking to get started running VA.gov locally, you should read the [Setting up your local frontend environment](https://depo-platform-documentation.scrollhelp.site/developer-docs/Setting-up-your-local-frontend-environment.1844215878.html) documentation.

## Common commands

Once you have the site set up locally, these are some common commands you might find useful:

| I want to...                        | Then you should...                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| fetch all dependencies              | `yarn install`. Run this any time `package.json` changes                       |
| build static HTML pages             | `yarn build`                                                                   |
| run the dev server                  | `yarn serve`. Uses port 3002, keeping 3001 free for vets-website dev server    |
| watch for template/css changes      | `yarn watch`. Runs the dev server while watching for changes                   |
| build CSS                           | `yarn build:webpack`. Runs the webpack                                         |
| watch for CSS changes               | `yarn build:webpack --watch`. Watch CSS for changes without watching templates |
| build in codespaces                 | `yarn build:codespaces`. Build with codespace options                          |
| watch in codespaces                 | `yarn watch:codespaces`. Watch with codespace options                          |

### Building static content

VA.gov contains many pages that include content generated from a Drupal-based content model.
When testing changes to static pages, or to see what your application looks like
on VA.gov, follow the sections below to build these static pages.

**Note**: Fetching content from Drupal requires SOCKS to be set up and running. Run `vtk socks on` in your terminal before attempting to pull any Drupal content for content-build.

#### Prepare Your Environment Settings

The Content-Build can pull fresh content directly from Drupal endpoints. To do this the request for content must be authenticated. 
If pulling fresh content you must ensure that these command line arguments or environment variables are set:

| Command Line Argument | Environment Variables | Purpose |
| ---- | ----------- | ----------- |
| `--drupal-user` | DRUPAL_USERNAME | Name of Drupal user that can read content. |
| `--drupal-password` | DRUPAL_PASSWORD | Password of Drupal user that can read content.  |
| `--drupal-address` | DRUPAL_ADDDRESS | Drupal Endpoint to pull content from. |

Authentication credentials are stored in a local .gitignore'd file `.env`. An example file is provided to get you started:

`cp .env.example .env`

File contents:
```
# .env file contents
DRUPAL_ADDRESS=https://cms-8ry6zt2asg946vdfuiryyamuc9gkuyzc.demo.cms.va.gov/
DRUPAL_USERNAME=content_build_api
DRUPAL_PASSWORD=drupal8
```

In most cases, these values will be all you need to run a content build with fresh CMS content. However, if you need to connect to a different CMS endpoint, you can either override the values in the `.env` file, or else override specific values at the command line. For example:

`yarn build --pull-drupal --drupal-address=https://some-other-endpoint.cms.va.gov`

If you do need to pull content from https://prod.cms.va.gov please contact
[#cms-support](https://dsva.slack.com/archives/CDHBKAL9W) and request a user with permissions to read the Drupal Content API. You will need to use your assigned credentials to access Production.


#### Build static pages using the following commands:

`yarn build` (fetches the latest content cache from S3 by default when cache is empty)

**Note**: running `yarn build` on `main` can take upwards of 8 hours. There are many Drupal assets to fetch and many templates to build. See **Optimizing Build Time** below to cut down on this time dramatically and only build the templates/assets you need for your development work.

- use `--pull-drupal` to fetch fresh content from Drupal if needed (requires SOCKS proxy access). Add `--use-cached-assets` to skip asset download
- creates symlink to `../vets-website/build/localhost/generated` by default, allowing access to app bundles (use `--apps-directory-name` to change the default apps directory name; e.g. `--apps-directory-name application`)
- run once to build the static HTML files
- need to run this again when adding new templates based on new Drupal entities

`yarn serve`

- starts a local server for the site using the latest build
- use `--port` to set the port for the server (`3002` by default)
- use `--buildtype` to set the build type (`localhost` by default)

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

#### Troubleshooting
The [vagov-content](https://github.com/department-of-veterans-affairs/vagov-content) repository sits adjacent to `content-build` in the same way that `vets-website` does. The markdown files in `vagov-content` are pulled in during the build process. If a markdown file is present in `vagov-content`, but the template was deleted in `content-build`, you'll see a build error that reads something like this:

```
[Error: ENOENT: no such file or directory, open '{file path on your local machine}']
```

If this happens to you, make sure you have the latest from the `vagov-content` on your local machine, and try building `content-build` again.

## Optimizing Build Time
Another method to optimize your build / watch time for content-build is to ignore templates and assets that you do not need for local testing. For instance, if you are only working on Campaign Landing Pages, you can skip building a lot of the other content types (such as Resources & Support pages and Events). If you do not need to pull any Drupal assets (such as images), you can skip that step too. This will tremendously speed up your build time.

1. Open `src/site/stages/build/drupal/individual-queries.js`
2. Find the `getNodeQueries` function
3. Comment out any content types you will not need (leaving in basic page / landing page queries just in case). If you're working on Campaign Landing Pages, your function might look like this:

```
function getNodeQueries(entityCounts) {
  return {
    ...getNodePageQueries(entityCounts),
    GetNodeLandingPages,
    // ...getNodeVaFormQueries(entityCounts),
    // ...getNodeHealthCareRegionPageQueries(entityCounts),
    // ...getNodePersonProfileQueries(entityCounts),
    // ...getNodeOfficeQueries(entityCounts),
    // ...getNodeHealthCareLocalFacilityPageQueries(entityCounts),
    // ...getNodeHealthServicesListingPageQueries(entityCounts),
    // ...getNewsStoryQueries(entityCounts),
    // ...getPressReleaseQueries(entityCounts),
    // GetNodePressReleaseListingPages,
    // ...getNodeEventListingQueries(entityCounts),
    // ...getNodeEventQueries(entityCounts),
    // ...getVaPoliceQueries(entityCounts),
    // GetNodeStoryListingPages,
    // GetNodeLocationsListingPages,
    // GetNodeLeadershipListingPages,
    // GetNodeVamcOperatingStatusAndAlerts,
    // GetNodePublicationListingPages,
    // ...getNodeHealthCareRegionDetailPageQueries(entityCounts),
    // ...getNodeQaQueries(entityCounts),
    // GetNodeMultipleQaPages,
    // GetNodeStepByStep,
    // GetNodeMediaListImages,
    // GetNodeChecklist,
    // GetNodeMediaListVideos,
    // GetNodeSupportResourcesDetailPage,
    GetNodeBasicLandingPage,
    GetCampaignLandingPages,
    // ...getVetCenterQueries(entityCounts),
    // ...getVbaFacilityQueries(entityCounts),
    // GetVetCenterLocations,
    // GetPolicyPages,
    // GetBillingAndInsurancePages,
    // GetRegisterForCarePages,
    // GetMedicalRecordsOfficePages,
  };
}
```

4. Open `src/site/stages/build/index.js`
5. Find this line: `smith.use(downloadDrupalAssets(BUILD_OPTIONS), 'Download Drupal assets');` and comment it out
6. Delete your `.cache/localhost/drupal/pages.json` file
7. Make sure you are running SOCKS (`vtk socks on`)
8. Run `yarn build --pull-drupal && yarn watch` in your terminal to get the dev server running with your new template selections

## Working in GitHub Codespaces

[Read the Codespaces documentation for this repository](https://depo-platform-documentation.scrollhelp.site/developer-docs/Using-GitHub-Codespaces.1909063762.html#UsingGitHubCodespaces-Codespacesinvets-websiteandcontent-buildrepositories).

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
| run only E2E tests (headless)                                                                               | Make sure the site is running locally (`yarn watch`) and run the tests with `yarn cy:run`                                                                                                                                  |
| run E2E tests in the browser                                                                                | `yarn cy:open`                                                                                                                                                                                                     |
| run all linters                                                                                             | `yarn lint`                                                                                                                                                                                                                  |
| run only javascript linter                                                                                  | `yarn lint:js`                                                                                                                                                                                                               |
| run lint on JS and fix anything that changed                                                                | `yarn lint:js:changed:fix`                                                                                                                                                                                                   |
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

## Not a member of the repository and want to be added?
- If you're on a VA.gov Platform team, contact your Program Manager.
- If you're on a VFS team, you must complete [Platform Orientation](https://depo-platform-documentation.scrollhelp.site/getting-started/platform-orientation) to be added to this repository. This includes completing your Platform Orientation ticket(s) in GitHub.
