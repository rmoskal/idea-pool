const assert = require('assert')
const jwt = require('jsonwebtoken')
const restify = require('restify')
const R = require('ramda')
const helpers = require('./Helpers')

module.exports = function (deps) {
  const userStore = deps.userStore

  userStore.ensureIndex({fieldName: 'email', unique: true})

  function checkAndFetchUser ({email, password}) {
    return helpers.pipePP(
      userStore.findOne,
      isNotNil('User not Found'),
      assertSomeProperty(throwUnauthorizedError('Password does not match'), password, 'password')
    )({email})
  }

  function checkAndFetchUserByRefreshToken (_in) {
    return helpers.pipePP(
      userStore.findOne,
      isNotNil('no user token'),
      assertSomeProperty(throwBadRequestError('Bad token'), _in.refresh_token, 'refreshToken')
    )({refreshToken: _in.refresh_token})
  }

  function updateUser (user) {
    return userStore.update({_id: user._id}, user, {returnUpdatedDocs: true}).then(res => R.tail(res)[0])
  }

  function validateNewUserInput (_in) {
    return R.pipe(
    helpers.checkRequiredFields(['name', 'email', 'password']),
    validatePassword,
    validateEmail)(_in)
  }

  function generateToken (user) {
    return {
      jwt: _generateToken(R.dissoc('password')(user)),
      refresh_token: user.refreshToken
    }
  }

  function validatePassword (_in) {
    assert(isValidPassword(_in.password))
    return _in
  }

  const isNotNil = R.curry((msg, _in) => R.when(R.isNil, throwBadRequestError(msg))(_in))
  const assertSomeProperty = R.curry((err, val, prop) => R.unless(R.propEq(prop, val), err)
  )

  function validateEmail (_in) {
    assert(isValidEmail(_in.email))
    return _in
  }

  function _generateToken (user) {
    return jwt.sign(user, deps.config.JWT_SECRET, {expiresIn: '10m'})
  }

  function isValidPassword (_in) {
    return (
    /.{8,}/.test(_in) &&
    /[a-z]/.test(_in) &&
    /[A-Z]/.test(_in) &&
    /[0-9]/.test(_in)
    )
  }

  function throwUnauthorizedError (msg) {
    return () => { throw new restify.errors.UnauthorizedError(msg) }
  }

  function throwBadRequestError (msg) {
    return () => { throw new restify.errors.BadRequestError(msg) }
  }

  function isValidEmail (_in) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(_in) // eslint-disable-line
  }

  return {
    checkAndFetchUser,
    checkAndFetchUserByRefreshToken,
    validateNewUserInput,
    generateToken,
    updateUser,
    _generateToken,
    validateEmail,
    validatePassword,
    isValidPassword,
    isValidEmail
  }
}
