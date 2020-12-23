@Library('va.gov-devops-jenkins-lib') _
import org.kohsuke.github.GitHub

env.CONCURRENCY = 10


node('vetsgov-general-purpose') {
  properties([[$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60']],
              parameters([choice(name: "cmsEnvBuildOverride",
                                 description: "Choose an environment to run a content only build. Select 'none' to run the regular pipeline.",
                                 choices: ["none", "dev", "staging"].join("\n"))])]);

  // Checkout content-build code
  dir("content-build") {
    checkout scm
    ref = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
  }

  def commonStages = load "content-build/jenkins/common.groovy"

  // // setupStage
  dockerContainer = commonStages.setup()

  // Perform a build for each build type
  envsUsingDrupalCache = commonStages.buildAll(ref, dockerContainer, params.cmsEnvBuildOverride != 'none')

  // Run E2E and accessibility tests
  stage('Integration') {
    // Remove for now since I want it to run.
    if (commonStages.shouldBail() || !commonStages.VAGOV_BUILDTYPES.contains('vagovstaging')) { return }
    dir("content-build") {
      try {
        parallel (
          'nightwatch-e2e': {
            sh "export IMAGE_TAG=${commonStages.IMAGE_TAG} && docker-compose -p nightwatch up -d && docker-compose -p nightwatch run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovstaging content-build --no-color run nightwatch:docker"
          },

          'nightwatch-accessibility': {
            sh "export IMAGE_TAG=${commonStages.IMAGE_TAG} && docker-compose -p accessibility up -d && docker-compose -p accessibility run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovstaging content-build --no-color run nightwatch:docker -- --env=accessibility"
          },

          "check-broken-links": {
            sh "export IMAGE_TAG=${commonStages.IMAGE_TAG}"
            sh "docker-compose -p check-broken-links up -d"
            sh "docker-compose -p check-broken-links run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovstaging content-build --no-color run fetch-drupal-cache -- --buildtype=vagovstaging"
            sh "docker-compose -p check-broken-links run --rm --entrypoint=npm -e BABEL_ENV=test -e BUILDTYPE=vagovstaging content-build --no-color run build --validateContent --drupal-fail-fast -- --buildtype=vagovstaging"
          },
        )
      } catch (error) {
        // commonStages.slackNotify()
        throw error
      } finally {
        sh "docker-compose -p nightwatch down --remove-orphans"
        sh "docker-compose -p accessibility down --remove-orphans"
        sh "docker-compose -p check-broken-links down --remove-orphans"
        step([$class: 'JUnitResultArchiver', testResults: 'logs/nightwatch/**/*.xml'])
      }
    }
  }

  // commonStages.prearchiveAll(dockerContainer)

  // commonStages.archiveAll(dockerContainer, ref);
  // commonStages.cacheDrupalContent(dockerContainer, envsUsingDrupalCache);

  // stage('Review') {
  //   if (commonStages.shouldBail()) {
  //     currentBuild.result = 'ABORTED'
  //     return
  //   }

  //   try {
  //     if (!commonStages.isReviewable()) {
  //       return
  //     }
  //     build job: 'deploys/vets-review-instance-deploy', parameters: [
  //       stringParam(name: 'devops_branch', value: 'master'),
  //       stringParam(name: 'api_branch', value: 'master'),
  //       stringParam(name: 'web_branch', value: env.BRANCH_NAME),
  //       stringParam(name: 'source_repo', value: 'content-build'),
  //     ], wait: false
  //   } catch (error) {
  //     commonStages.slackNotify()
  //     throw error
  //   }
  // }

  // stage('Deploy dev or staging') {
  //   try {
  //     if (!commonStages.isDeployable()) { return }

  //     if (commonStages.IS_DEV_BRANCH && commonStages.VAGOV_BUILDTYPES.contains('vagovdev')) {
  //       commonStages.runDeploy('deploys/content-build-vagovdev', ref, false)
  //     }

  //     if (commonStages.IS_STAGING_BRANCH && commonStages.VAGOV_BUILDTYPES.contains('vagovstaging')) {
  //       commonStages.runDeploy('deploys/content-build-vagovstaging', ref, false)
  //     }

  //   } catch (error) {
  //     commonStages.slackNotify()
  //     throw error
  //   }
  // }
}
