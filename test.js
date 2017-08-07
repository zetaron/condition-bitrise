var test = require('tap').test
var SRError = require('@semantic-release/error')

var condition = require('./')

test('raise errors in bitrise environment', function (t) {
  t.test('only runs on ci', function (tt) {
    tt.plan(2)

    condition({}, {env: {}}, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'ENOCI')
    })
  })

  t.test('not running on pull requests', function (tt) {
    tt.plan(2)
    condition({}, {
      env: {
        CI: 'true',
        BITRISE_PULL_REQUEST: 'true'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EPULLREQUEST')
    })
  })

  t.test('only running on specified branch', function (tt) {
    tt.plan(5)

    condition({}, {
      env: {
        CI: 'true',
        BITRISE_GIT_BRANCH: 'master'
      },
      options: {
        branch: 'master'
      }
    }, function (err) {
      tt.is(err, null)
    })

    condition({}, {
      env: {
        CI: 'true',
        BITRISE_GIT_BRANCH: 'notmaster'
      },
      options: {
        branch: 'master'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EBRANCHMISMATCH')
    })

    condition({}, {
      env: {
        CI: 'true',
        BITRISE_GIT_BRANCH: 'master'
      },
      options: {
        branch: 'foo'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EBRANCHMISMATCH')
    })
  })

  t.test('not running on tags', function (tt) {
    tt.plan(2)
    condition({}, {
      env: {
        CI: 'true',
        BITRISE_GIT_TAG: 'v1.0.0'
      },
      options: {}
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EGITTAG')
    })
  })

  t.end()
})
