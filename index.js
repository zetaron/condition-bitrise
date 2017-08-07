var semver = require('semver')
var SRError = require('@semantic-release/error')

module.exports = function (pluginConfig, config, cb) {
  var env = config.env
  var options = config.options

  if (env.CI !== 'true') {
    return cb(new SRError(
      'semantic-release didn’t run on Bitrise and therefore a new version won’t be published.\n' +
      'You can customize this behavior using "verifyConditions" plugins: git.io/sr-plugins',
      'ENOCI'
    ))
  }

  if (env.hasOwnProperty('BITRISE_PULL_REQUEST') && env.BITRISE_PULL_REQUEST !== 'false') {
    return cb(new SRError(
      'This test run was triggered by a pull request and therefore a new version won’t be published.',
      'EPULLREQUEST'
    ))
  }

  if (semver.valid(env.BITRISE_GIT_TAG)) {
    return cb(new SRError(
      'This test run was triggered by a git tag that was created by semantic-release itself.\n' +
      'Everything is okay. For log output of the actual publishing process look at the build that ran before this one.',
      'EGITTAG'
    ))
  }

  if (options.branch === env.BITRISE_GIT_BRANCH) return cb(null)

  return cb(new SRError(
    'This test run was triggered on the branch ' + env.BITRISE_GIT_BRANCH +
    ', while semantic-release is configured to only publish from ' +
    options.branch + '.\n' +
    'You can customize this behavior using the "branch" option: git.io/sr-options',
    'EBRANCHMISMATCH'
  ))
}
