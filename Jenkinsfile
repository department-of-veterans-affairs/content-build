@Library('va.gov-devops-jenkins-lib') _
import org.kohsuke.github.GitHub

env.CONCURRENCY = 10


node('vetsgov-general-purpose') {
  properties([[$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60']],
              parameters([choice(name: "cmsEnvBuildOverride",
                                 description: "Choose an environment to run a content only build. Select 'none' to run the regular pipeline.",
                                 choices: ["none", "vagovdev", "vagovstaging"].join("\n")),
                          booleanParam(name: "cancelBuild",
                                       defaultValue: true,
                                       description: "Hack to cancel the run triggered by webhook")])]);

  stage('Cancel') {
    if (params.cancelBuild) {
      currentBuild.result = 'ABORTED'
      error("Aborting run triggered by webhook. Please wait for the run triggered by the GitHub Actions workflow.");
    }
  }

  // Checkout content-build code
  dir("content-build") {
    checkout scm
    ref = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
  }

  def commonStages = load "content-build/jenkins/common.groovy"
  def envUsedCache = [:]

  // setupStage
  dockerContainer = commonStages.setup()

  stage('Review') {
    if (commonStages.shouldBail()) {
      currentBuild.result = 'ABORTED'
      return
    }

    try {
      if (!commonStages.isReviewable()) {
        return
      }
      build job: 'deploys/vets-review-instance-deploy', parameters: [
        stringParam(name: 'devops_branch', value: 'master'),
        stringParam(name: 'api_branch', value: 'master'),
        stringParam(name: 'web_branch', value: env.BRANCH_NAME),
        stringParam(name: 'content_branch', value: env.BRANCH_NAME),
        stringParam(name: 'source_repo', value: 'content-build'),
      ], wait: false
    } catch (error) {
      // commonStages.slackNotify()
      throw error
    }
  }
}
