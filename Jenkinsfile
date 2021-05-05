@Library('va.gov-devops-jenkins-lib') _
import org.kohsuke.github.GitHub

env.CONCURRENCY = 10


node('vetsgov-general-purpose') {
  properties([[$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60']],
              parameters([choice(name: "cmsEnvBuildOverride",
                                 description: "Choose an environment to run a content only build. Select 'none' to run the regular pipeline.",
                                 choices: ["none", "vagovdev", "vagovstaging"].join("\n"))])]);

  // Checkout content-build code
  dir("content-build") {
    checkout scm
    ref = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
  }

  def commonStages = load "content-build/jenkins/common.groovy"
  def envUsedCache = [:]

  // // setupStage
  dockerContainer = commonStages.setup()

  stage('Main') {
    def contentOnlyBuild = params.cmsEnvBuildOverride != 'none'
    def assetSource = contentOnlyBuild ? ref : 'local'

    try {
      parallel (
        failFast: true,

        buildDev: {
          if (commonStages.shouldBail()) { return }
          def envName = 'vagovdev'
          
          def shouldBuild = !contentOnlyBuild || envName == params.cmsEnvBuildOverride
          if (!shouldBuild) { return }

          try {
            // Try to build using fresh drupal content
            commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
            envUsedCache[envName] = false
          } catch (error) {
            if (!contentOnlyBuild) {
              dockerContainer.inside(DOCKER_ARGS) {
                sh "cd /application && node script/drupal-aws-cache.js --fetch --buildtype=${envName}"
              }
              // Try to build again using cached drupal content
              commonStages.build(ref, dockerContainer, assetSource, envName, true, contentOnlyBuild, '/application')
              envUsedCache[envName] = true
            } else {
              commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
              envUsedCache[envName] = false
            }
          }
        },

        buildStaging: {
          if (commonStages.shouldBail()) { return }
          def envName = 'vagovstaging'

          def shouldBuild = !contentOnlyBuild || envName == params.cmsEnvBuildOverride
          if (!shouldBuild) { return }

          try {
            // Try to build using fresh drupal content
            commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
            envUsedCache[envName] = false
          } catch (error) {
            if (!contentOnlyBuild) {
              dockerContainer.inside(DOCKER_ARGS) {
                sh "cd /application && node script/drupal-aws-cache.js --fetch --buildtype=${envName}"
              }
              // Try to build again using cached drupal content
              commonStages.build(ref, dockerContainer, assetSource, envName, true, contentOnlyBuild, '/application')
              envUsedCache[envName] = true
            } else {
              commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
              envUsedCache[envName] = false
            }
          }
        },

        buildProd: {
          if (commonStages.shouldBail()) { return }
          def envName = 'vagovprod'

          def shouldBuild = !contentOnlyBuild || envName == params.cmsEnvBuildOverride
          if (!shouldBuild) { return }
                    
          try {
            // Try to build using fresh drupal content
            commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
            envUsedCache[envName] = false
          } catch (error) {
            if (!contentOnlyBuild) {
              dockerContainer.inside(DOCKER_ARGS) {
                sh "cd /application && node script/drupal-aws-cache.js --fetch --buildtype=${envName}"
              }
              // Try to build again using cached drupal content
              commonStages.build(ref, dockerContainer, assetSource, envName, true, contentOnlyBuild, '/application')
              envUsedCache[envName] = true
            } else {
              commonStages.build(ref, dockerContainer, assetSource, envName, false, contentOnlyBuild, '/application')
              envUsedCache[envName] = false
            }
          }
        },

        lint: {
          if (params.cmsEnvBuildOverride != 'none') { return }
          dockerContainer.inside(commonStages.DOCKER_ARGS) {
            sh "cd /application && npm --no-color run lint"
          }
        },

        // Check package.json for known vulnerabilities
        security: {
          if (params.cmsEnvBuildOverride != 'none') { return }
          retry(3) {
            dockerContainer.inside(commonStages.DOCKER_ARGS) {
              sh "cd /application && npm run security-check"
            }
          }
        },

        unit: {
          if (params.cmsEnvBuildOverride != 'none') { return }
          dockerContainer.inside(commonStages.DOCKER_ARGS) {
            sh "/cc-test-reporter before-build"
            sh "cd /application && npm --no-color run test:unit -- --coverage"
            sh "cd /application && /cc-test-reporter after-build -r fe4a84c212da79d7bb849d877649138a9ff0dbbef98e7a84881c97e1659a2e24"
          }
        },

      )
    } catch (error) {
      commonStages.slackNotify()
      throw error
    } finally {
      dir("content-build") {
        step([$class: 'JUnitResultArchiver', testResults: 'test-results.xml'])
      }
    }
  }

  // Run E2E tests
  commonStages.integrationTests(dockerContainer, ref);

  // Point all URLs to the proper S3 bucket
  commonStages.prearchiveAll(dockerContainer)

  // Archive the tar file for each build type
  commonStages.archiveAll(dockerContainer, ref);

  envsUsingDrupalCache = envUsedCache
  commonStages.cacheDrupalContent(dockerContainer, envsUsingDrupalCache);

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

  stage('Deploy dev or staging') {
    try {
      if (!commonStages.isDeployable()) { return }

      if (commonStages.IS_DEV_BRANCH && commonStages.VAGOV_BUILDTYPES.contains('vagovdev')) {
        commonStages.runDeploy('deploys/content-build-vagovdev', ref, false)
      }

      if (commonStages.IS_STAGING_BRANCH && commonStages.VAGOV_BUILDTYPES.contains('vagovstaging')) {
        commonStages.runDeploy('deploys/content-build-vagovstaging', ref, false)
      }

    } catch (error) {
      commonStages.slackNotify()
      throw error
    }
  }
}
