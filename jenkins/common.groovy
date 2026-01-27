DRUPAL_MAPPING = [
  'dev': 'vagovdev',
  'staging': 'vagovstaging',
  'prod': 'vagovprod',
]

DRUPAL_ADDRESSES = [
  'vagovdev'    : 'https://dev.cms.va.gov',
  'vagovstaging': 'https://staging.cms.va.gov',
  'vagovprod'   : 'https://prod.cms.va.gov',
   // This is a Tugboat URL, rebuilt frequently from PROD CMS. See https://tugboat.vfs.va.gov/6042f35d6a89945fd6399dc3.
   // If there are issues with this endpoint, please post in #cms-support Slack and tag @CMS DevOps Engineers.
   'sandbox'     : 'https://cms-content-build-medc0xjkxm4jmpzxl3tfbcs7qcddsivh.ci.cms.va.gov',
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

DEV_BRANCH = 'main'
STAGING_BRANCH = 'main'
PROD_BRANCH = 'main'

IS_DEV_BRANCH = env.BRANCH_NAME == DEV_BRANCH
IS_STAGING_BRANCH = env.BRANCH_NAME == STAGING_BRANCH
IS_PROD_BRANCH = env.BRANCH_NAME == PROD_BRANCH

DOCKER_ARGS = "-v ${WORKSPACE}/content-build:/application -v ${WORKSPACE}/vets-website:/vets-website -v ${WORKSPACE}/vagov-content:/vagov-content --ulimit nofile=8192:8192"
IMAGE_TAG = java.net.URLDecoder.decode(env.BUILD_TAG).replaceAll("[^A-Za-z0-9\\-\\_]", "-")
DOCKER_TAG = "content-build:" + IMAGE_TAG

def isReviewable() {
  return !IS_DEV_BRANCH && !IS_STAGING_BRANCH && !IS_PROD_BRANCH
}

def shouldBail() {
  // abort the job if we're not on deployable branch (usually main) and there's a newer build going now
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

def setup() {
  stage("Setup") {

    dir("vagov-content") {
      checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: '*/main']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CloneOption', noTags: true, reference: '', shallow: true]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'va-bot', url: 'git@github.com:department-of-veterans-affairs/vagov-content.git']]]
    }

    dir("vets-website") {
      checkout changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: '*/main']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CloneOption', noTags: true, reference: '', shallow: true]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'va-bot', url: 'git@github.com:department-of-veterans-affairs/vets-website.git']]]
    }

    dir("content-build") {

      sh "mkdir -p build"
      sh "mkdir -p temp"

      dockerImage = docker.build(DOCKER_TAG)
      retry(5) {
        dockerImage.inside(DOCKER_ARGS) {
          // sh "cd /vets-website && yarn install-safe --frozen-lockfile --production=false --scripts-prepend-node-path=/opt/bitnami/node/bin/node"
          sh "cd /application && yarn install-safe --frozen-lockfile --production=false"
        }

      }
      return dockerImage
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
  // we are building the main branch's production environment.
  if (
    contentOnlyBuild ||
    (IS_PROD_BRANCH && envName == 'vagovprod')
  ) {
     drupalAddress = DRUPAL_ADDRESSES.get('vagovprod')
     noDrupalProxy = ''
  }

  if (useCache) {
    slackSend(
      message: "(Jenkins) -- Try to build again using cached drupal content |${env.RUN_DISPLAY_URL}".stripMargin(),
      color: 'warning',
      failOnError: true,
      channel: 'gha-build-status'
    )
  }

  withCredentials([usernamePassword(credentialsId:  "${drupalCred}", usernameVariable: 'DRUPAL_USERNAME', passwordVariable: 'DRUPAL_PASSWORD')]) {
    dockerContainer.inside(DOCKER_ARGS) {
      def buildLogPath = "${buildPath}/${envName}-build.log"

      sh "cd ${buildPath} && jenkins/build.sh --envName ${envName} --assetSource ${assetSource} --drupalAddress ${drupalAddress} --drupalMaxParallelRequests ${drupalMaxParallelRequests} ${drupalMode} ${noDrupalProxy} --buildLog ${buildLogPath} --verbose ${localhostBuild}"

      sh "cd ${buildPath} && echo \"${buildDetails}\" > build/${envName}/BUILD.txt"
    }
  }
}

def prearchive(dockerContainer, envName) {
  dockerContainer.inside(DOCKER_ARGS) {
    sh "cd /application && node script/prearchive.js --buildtype=${envName}"
  }
}

def archive(dockerContainer, String ref, String envName) {
  dockerContainer.inside(DOCKER_ARGS) {
    withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'vetsgov-website-builds-s3-upload',
                     usernameVariable: 'AWS_ACCESS_KEY', passwordVariable: 'AWS_SECRET_KEY']]) {
      if(envName == 'vagovprod') {
        sh "tar -C /application/build/${envName} -cf /application/build/${envName}.tar.bz2 ."
        sh "aws s3 cp /application/build/${envName}.tar.bz2 s3://vetsgov-website-builds-s3-upload/content-build/${ref}/${envName}.tar.bz2 --acl public-read --region us-gov-west-1 --quiet"
      }
    }
  }
}

return this;
