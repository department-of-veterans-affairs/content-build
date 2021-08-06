DRUPAL_MAPPING = [
  'dev': 'vagovdev',
  'staging': 'vagovstaging',
  'prod': 'vagovprod',
]

DRUPAL_ADDRESSES = [
  'vagovdev'    : 'http://internal-dsva-vagov-dev-cms-812329399.us-gov-west-1.elb.amazonaws.com',
  'vagovstaging': 'http://internal-dsva-vagov-staging-cms-1188006.us-gov-west-1.elb.amazonaws.com',
  'vagovprod'   : 'http://internal-dsva-vagov-prod-cms-2000800896.us-gov-west-1.elb.amazonaws.com',
   // This is a Tugboat URL, rebuilt frequently from PROD CMS. See https://tugboat.vfs.va.gov/6042f35d6a89945fd6399dc3.
   // If there are issues with this endpoint, please post in #cms-support Slack and tag @CMS DevOps Engineers.
   'sandbox'     : 'https://cms-vets-website-branch-builds-lo9uhqj18nwixunsjadvjsynuni7kk1u.ci.cms.va.gov',
]

DRUPAL_CREDENTIALS = [
  'vagovdev'    : 'drupal-dev',
  'vagovstaging': 'drupal-staging',
  'vagovprod'   : 'drupal-prod',
]

ALL_VAGOV_BUILDTYPES = [
  'vagovdev',
  'vagovstaging',
  'vagovprod'
]

BUILD_TYPE_OVERRIDE = DRUPAL_MAPPING.get(params.cmsEnvBuildOverride, null)

VAGOV_BUILDTYPES = BUILD_TYPE_OVERRIDE ? [BUILD_TYPE_OVERRIDE] : ALL_VAGOV_BUILDTYPES

DEV_BRANCH = 'master'
STAGING_BRANCH = 'master'
PROD_BRANCH = 'master'

IS_DEV_BRANCH = env.BRANCH_NAME == DEV_BRANCH
IS_STAGING_BRANCH = env.BRANCH_NAME == STAGING_BRANCH
IS_PROD_BRANCH = env.BRANCH_NAME == PROD_BRANCH

DOCKER_ARGS = "-v ${WORKSPACE}/content-build:/application -v ${WORKSPACE}/vets-website:/vets-website -v ${WORKSPACE}/vagov-content:/vagov-content --ulimit nofile=8192:8192"
IMAGE_TAG = java.net.URLDecoder.decode(env.BUILD_TAG).replaceAll("[^A-Za-z0-9\\-\\_]", "-")
DOCKER_TAG = "content-build:" + IMAGE_TAG

def isReviewable() {
  return !IS_DEV_BRANCH && !IS_STAGING_BRANCH && !IS_PROD_BRANCH
}

def isDeployable() {
  return (IS_DEV_BRANCH ||
          IS_STAGING_BRANCH) &&
    !env.CHANGE_TARGET &&
    !currentBuild.nextBuild // if there's a later build on this job (branch), don't deploy
}

def shouldBail() {
  // abort the job if we're not on deployable branch (usually master) and there's a newer build going now
  return !IS_DEV_BRANCH &&
    !IS_STAGING_BRANCH &&
    !IS_PROD_BRANCH &&
    !env.CHANGE_TARGET &&
    currentBuild.nextBuild
}

def runDeploy(String jobName, String ref, boolean waitForDeploy) {
  build job: jobName, parameters: [
    booleanParam(name: 'notify_slack', value: true),
    stringParam(name: 'ref', value: ref),
  ], wait: waitForDeploy
}

def buildDetails(String buildtype, String ref, Long buildtime) {
  return """\
BUILDTYPE=${buildtype}
NODE_ENV=production
BRANCH_NAME=${env.BRANCH_NAME}
CHANGE_TARGET=${env.CHANGE_TARGET}
BUILD_ID=${env.BUILD_ID}
BUILD_NUMBER=${env.BUILD_NUMBER}
REF=${ref}
BUILDTIME=${buildtime}
"""
}

def slackNotify() {
  if (IS_DEV_BRANCH || IS_STAGING_BRANCH || IS_PROD_BRANCH) {
    message = "content-build ${env.BRANCH_NAME} branch CI failed. |${env.RUN_DISPLAY_URL}".stripMargin()
    slackSend message: message,
      color: 'danger',
      failOnError: true
  }
}

def slackIntegrationNotify() {
  message = "(Testing): integration tests failed. |${env.RUN_DISPLAY_URL}".stripMargin()
  slackSend message: message,
    color: 'danger',
    failOnError: true
}

def slackCachedContent(envName) {
  message = "content-build built with cached Drupal data for ${envName}. |${env.RUN_DISPLAY_URL}".stripMargin()
  slackSend message: message,
    color: 'warning',
    failOnError: true
}

def setup() {
  stage("Setup") {

    dir("vagov-content") {
      checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CloneOption', noTags: true, reference: '', shallow: true]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'va-bot', url: 'git@github.com:department-of-veterans-affairs/vagov-content.git']]]
    }

    dir("vets-website") {
      checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CloneOption', noTags: true, reference: '', shallow: true]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'va-bot', url: 'git@github.com:department-of-veterans-affairs/vets-website.git']]]
    }

    dir("content-build") {

      sh "mkdir -p build"
      sh "mkdir -p temp"

      dockerImage = docker.build(DOCKER_TAG)
      retry(5) {
        dockerImage.inside(DOCKER_ARGS) {
          // sh "cd /vets-website && yarn install --frozen-lockfile --production=false --scripts-prepend-node-path=/opt/bitnami/node/bin/node"
          sh "cd /application && yarn install --frozen-lockfile --production=false"
        }

      }
      return dockerImage
    }

  }
}

def accessibilityTests() {

  if (shouldBail() || !VAGOV_BUILDTYPES.contains('vagovprod')) { return }

  stage("Accessibility") {

     slackSend(
        message: "Starting the daily accessibility scan of content-build... ${env.RUN_DISPLAY_URL}".stripMargin(),
        color: 'good',
        channel: '-daily-accessibility-scan'
      )

    dir("content-build") {
      try {
        parallel (
          'nightwatch-accessibility': {
            sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p accessibility up -d && docker-compose -p accessibility run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovprod content-build --no-color run nightwatch:docker -- --env=accessibility"
          },
        )

        slackSend(
          message: 'The daily accessibility scan has completed successfully.',
          color: 'good',
          channel: '-daily-accessibility-scan'
        )

      } catch (error) {

        slackSend(
            message: "@here Daily accessibility tests have failed. ${env.RUN_DISPLAY_URL}".stripMargin(),
            color: 'danger',
            failOnError: true,
            channel: '-daily-accessibility-scan'
          )

        throw error
      } finally {
        sh "docker-compose -p accessibility down --remove-orphans"
        step([$class: 'JUnitResultArchiver', testResults: 'logs/nightwatch/**/*.xml'])
      }
    }

  }
}

def uploadBrokenLinksFile(String brokenLinksFile, String envName) {
  const s3Url = "s3://vetsgov-website-builds-s3-upload/broken-link-reports/${envName}-broken-links.json"
  sh "aws s3 cp ${brokenLinksFile} ${s3Url} --acl public-read --region us-gov-west-1 --quiet"

  echo "Uploaded broken links file for ${envName}"
}

def checkForBrokenLinks(String buildLogPath, String envName, Boolean contentOnlyBuild) {
  def brokenLinksFile = "${WORKSPACE}/content-build/logs/${envName}-broken-links.json"

  if (fileExists(brokenLinksFile)) {
    def rawJsonFile = readFile(brokenLinksFile);
    def brokenLinks = new groovy.json.JsonSlurper().parseText(rawJsonFile);
    def maxBrokenLinks = 10
    def color = 'warning'
    // When broken links are reported in a content-only deployment the branch returns null
    def source = env.BRANCH_NAME == null ? 'a content-only deployment' : env.BRANCH_NAME;

    if (brokenLinks.isHomepageBroken || brokenLinks.brokenLinksCount > maxBrokenLinks) {
      color = 'danger'
    }

    def heading = "@cmshelpdesk ${brokenLinks.brokenLinksCount} broken links found in the `${envName}` build in `${source}`\n\n${env.RUN_DISPLAY_URL}\n\n"
    def message = "${heading}\n${brokenLinks.summary}".stripMargin()

    echo "${brokenLinks.brokenLinksCount} broken links found"
    echo message

    // Unset brokenLinks now that we're done with this, because Jenkins may temporarily
    // freeze (through serialization) this pipeline while uploading the broken links file
    // or sending the Slack message. brokenLinks is an instance of JSONObject, which
    // cannot be serialized by default.
    brokenLinks = null

    uploadBrokenLinksFile(brokenLinksFile, envName)

    if (!IS_PROD_BRANCH && !contentOnlyBuild) {
      // Ignore the results of the broken link checker unless
      // we are running either on the master branch or during
      // a Content Release. This way, if there is a broken link,
      // feature branches aren't affected, so VFS teams can
      // continue merging.
      return;
    }

    slackSend(
      message: message,
      color: color,
      failOnError: true,
      channel: 'vfs-platform-builds'
    )

    if (color == 'danger') {
      throw new Exception('Broken links found')
    }
  }
}

def build(String ref, dockerContainer, String assetSource, String envName, Boolean useCache, Boolean contentOnlyBuild, String buildPath) {
  def long buildtime = System.currentTimeMillis() / 1000L;
  def buildDetails = buildDetails(envName, ref, buildtime)
  // are not configured to deploy to prod.
  def drupalAddress = DRUPAL_ADDRESSES.get('sandbox')
  def drupalCred = DRUPAL_CREDENTIALS.get('vagovprod')
  def drupalMode = useCache ? '' : '--pull-drupal'
  def localhostBuild = envName == 'vagovdev' ? '--omitdebug' : ''
  def drupalMaxParallelRequests = 15;
  def noDrupalProxy = '--no-drupal-proxy'

   // Build using the CMS Production instance only if we are doing
  // a content-only build (as part of a Content Release) OR if
  // we are building the master branch's production environment.
  if (
    contentOnlyBuild ||
    (IS_PROD_BRANCH && envName == 'vagovprod')
  ) {
     drupalAddress = DRUPAL_ADDRESSES.get('vagovprod')
     noDrupalProxy = ''
  }

  withCredentials([usernamePassword(credentialsId:  "${drupalCred}", usernameVariable: 'DRUPAL_USERNAME', passwordVariable: 'DRUPAL_PASSWORD')]) {
    dockerContainer.inside(DOCKER_ARGS) {
      def buildLogPath = "${buildPath}/${envName}-build.log"

      sh "cd ${buildPath} && jenkins/build.sh --envName ${envName} --assetSource ${assetSource} --drupalAddress ${drupalAddress} --drupalMaxParallelRequests ${drupalMaxParallelRequests} ${drupalMode} ${noDrupalProxy} --buildLog ${buildLogPath} --verbose ${localhostBuild}"

      if (envName == 'vagovprod') {
        checkForBrokenLinks(buildLogPath, envName, contentOnlyBuild)
      }

      sh "cd ${buildPath} && echo \"${buildDetails}\" > build/${envName}/BUILD.txt"
    }
  }
}

def integrationTests(dockerContainer, ref) {
  stage("Integration") {
    if (shouldBail()) { return }

    dir("content-build") {
      timeout(60) {
        try {
          if (IS_PROD_BRANCH && VAGOV_BUILDTYPES.contains('vagovprod')) {
            parallel (
              failFast: true,

              'nightwatch-e2e': {
                sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p nightwatch-${env.EXECUTOR_NUMBER} up -d && docker-compose -p nightwatch-${env.EXECUTOR_NUMBER} run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovprod content-build --no-color run nightwatch:docker"
              },
              // PAUSED UNTIL FIXED
              // 'nightwatch-accessibility': {
              //   sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p accessibility-${env.EXECUTOR_NUMBER} up -d && docker-compose -p accessibility-${env.EXECUTOR_NUMBER} run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovprod content-build --no-color run nightwatch:docker -- --env=accessibility"
              // },

              cypress: {
                sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p cypress-${env.EXECUTOR_NUMBER} up -d && docker-compose -p cypress-${env.EXECUTOR_NUMBER} run --rm --entrypoint=npm -e CI=true -e NO_COLOR=1 content-build --no-color run cy:test:docker"
              }
            )
          } else {
            parallel (
              failFast: true,

              'nightwatch-e2e': {
                sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p nightwatch-${env.EXECUTOR_NUMBER} up -d && docker-compose -p nightwatch-${env.EXECUTOR_NUMBER} run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovprod content-build --no-color run nightwatch:docker"
              },
              cypress: {
                sh "export IMAGE_TAG=${IMAGE_TAG} && docker-compose -p cypress-${env.EXECUTOR_NUMBER} up -d && docker-compose -p cypress-${env.EXECUTOR_NUMBER} run --rm --entrypoint=npm -e CI=true -e NO_COLOR=1 content-build --no-color run cy:test:docker"
              }
            )
          }
        } catch (error) {
          // slackIntegrationNotify()
          throw error
        } finally {
          sh "docker-compose -p nightwatch-${env.EXECUTOR_NUMBER} down --remove-orphans"
          if (IS_PROD_BRANCH && VAGOV_BUILDTYPES.contains('vagovprod')) {
            sh "docker-compose -p accessibility-${env.EXECUTOR_NUMBER} down --remove-orphans"
          }
          step([$class: 'JUnitResultArchiver', testResults: 'logs/nightwatch/**/*.xml'])
        }
      } // end timeout
    }

  }
}

def prearchive(dockerContainer, envName) {
  dockerContainer.inside(DOCKER_ARGS) {
    sh "cd /application && node script/prearchive.js --buildtype=${envName}"
  }
}

def prearchiveAll(dockerContainer) {
  stage("Prearchive Optimizations") {
    if (shouldBail()) { return }

    try {
      def builds = [:]

      for (int i=0; i<VAGOV_BUILDTYPES.size(); i++) {
        def envName = VAGOV_BUILDTYPES.get(i)

        builds[envName] = {
          prearchive(dockerContainer, envName)
        }
      }

      parallel builds
    } catch (error) {
      slackNotify()
      throw error
    }
  }
}

def archive(dockerContainer, String ref, String envName) {
  dockerContainer.inside(DOCKER_ARGS) {
    withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'vetsgov-website-builds-s3-upload',
                     usernameVariable: 'AWS_ACCESS_KEY', passwordVariable: 'AWS_SECRET_KEY']]) {
      sh "tar -C /application/build/${envName} -cf /application/build/${envName}.tar.bz2 ."
      sh "aws s3 cp /application/build/${envName}.tar.bz2 s3://vetsgov-website-builds-s3-upload/content-build/${ref}/${envName}.tar.bz2 --acl public-read --region us-gov-west-1 --quiet"
    }
  }
}

def archiveAll(dockerContainer, String ref) {
  stage("Archive") {
    if (shouldBail()) { return }

    try {
      def archives = [:]

      for (int i=0; i<VAGOV_BUILDTYPES.size(); i++) {
        def envName = VAGOV_BUILDTYPES.get(i)

        archives[envName] = {
          archive(dockerContainer, ref, envName)
        }
      }

      parallel archives

    } catch (error) {
      slackNotify()
      throw error
    }
  }
}

def cacheDrupalContent(dockerContainer, envUsedCache) {
  stage("Cache Drupal Content") {
    if (!isDeployable()) { return }

    try {
      def archives = [:]

      for (int i=0; i<VAGOV_BUILDTYPES.size(); i++) {
        def envName = VAGOV_BUILDTYPES.get(i)

        if (!envUsedCache[envName]) {
          dockerContainer.inside(DOCKER_ARGS) {
            sh "cd /application && node script/drupal-aws-cache.js --buildtype=${envName}"
          }
        } else {
          slackCachedContent(envName)
          // TODO: Read the envName-output.log and send that into the Slack message
        }
      }

      dockerContainer.inside(DOCKER_ARGS) {
        withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'vetsgov-website-builds-s3-upload',
                         usernameVariable: 'AWS_ACCESS_KEY', passwordVariable: 'AWS_SECRET_KEY']]) {
          sh "aws s3 sync /application/.cache/content s3://vetsgov-website-builds-s3-upload/content/ --acl public-read --region us-gov-west-1 --quiet"
        }
      }
    } catch (error) {
      slackNotify()
      throw error
    }
  }
}

return this;
