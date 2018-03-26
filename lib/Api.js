const helpers = require('./Helpers')
const R = require('ramda')
const uuidv4 = require('uuid/v4')

module.exports = function (deps) {
  const app = deps.app
  const userStore = deps.userStore
  const ideaStore = deps.ideaStore
  const userService = require('./UserServices')(deps)
  const ideaService = require('./IdeaServices')(deps)

  app.get('/test', (req, res, next) => {
    res.send({res: 'ok'})
    next()
  })

  app.put('/test', (req, res, next) => {
    res.send({res: 'ok'})
    next()
  })

  app.get('/protectedtest', (req, res, next) => {
    res.json(req.user)
    next()
  })

  /**
   * Get current user's info
   * https://small-project-api.herokuapp.com/api-docs#current-user-get-current-user-s-info
   */
  app.get('/me', (req, res, next) =>
    helpers.pipePP(
      () => userStore.findOne({_id: req.user._id}),
      R.dissoc('password'),
      helpers.setP('avatar_url', _in => `https://www.gravatar.com/avatar/${_in._id}?d=mm&s=200`)
    )(req.body)
      .then(user => res.json(user))
      .then(next)
      .catch(mapExceptions(next))
  )

  /**
   * Sign up a new user.
   * https://small-project-api.herokuapp.com/api-docs#users-signup
   */
  app.post('/users', (req, res, next) =>
    helpers.pipePP(
      userService.validateNewUserInput,
      helpers.setP('refreshToken', uuidv4), // Refresh token is a uuid
      userStore.insert
    )(req.body)
      .then(user => res.json(userService.generateToken(user)))
      .then(next)
      .catch(mapExceptions(next))
  )

  /**
   * User login
   * https://small-project-api.herokuapp.com/api-docs#accesstokens-user-login
   */
  app.post('/access-tokens', (req, res, next) =>
    helpers.pipePP(
      helpers.checkRequiredFields(['email', 'password']),
      userService.checkAndFetchUser,
      helpers.setP('refreshToken', uuidv4),
      userService.updateUser
    )(req.body)
      .then(user => res.json(userService.generateToken(user)))
      .then(next)
      .catch(mapExceptions(next))
  )

  /**
   * Refresh an access token
   * https://small-project-api.herokuapp.com/api-docs#accesstokens-refresh-jwt
   */
  app.post('/access-tokens/refresh', (req, res, next) =>
    helpers.pipePP(
      helpers.checkRequiredFields(['refresh_token']),
      userService.checkAndFetchUserByRefreshToken, // will die if the token is bad
      helpers.setP('refreshToken', uuidv4),
      userService.updateUser
    )(req.body)
      .then(user => res.json(userService.generateToken(user)))
      .then(next)
      .catch(mapExceptions(next))
  )
  /**
   * User logout
   * https://small-project-api.herokuapp.com/api-docs#accesstokens-user-logout
   */
  app.del('/access-tokens', (req, res, next) =>
    helpers.pipePP(
      helpers.checkRequiredFields(['refresh_token']),
      userService.checkAndFetchUserByRefreshToken,
      helpers.setP('refreshToken', ''),  // Wipe out the refresh token so it can no longer be used
      userService.updateUser
    )(req.body)
      .then(() => res.send(''))
      .then(next)
      .catch(mapExceptions(next))
  )

  /**
   * Create an idea
   * https://small-project-api.herokuapp.com/api-docs#ideas-create-idea
   */
  app.post('/ideas', (req, res, next) =>
    helpers.pipePP(
      R.pick(ideaService.members),  // let's remove any extra fields
      ideaService.validateForCreation,
      ideaService.decorateForCreation(req.user._id),
      ideaStore.insert,
      ideaService.sanitizeIdeaForDisplay
    )(req.body)
      .then(idea => res.json(idea))
      .then(next)
      .catch(mapExceptions(next))
  )
  /**
   * Update an idea
   * https://small-project-api.herokuapp.com/api-docs#ideas-update-idea
   */
  app.put('/ideas/:id', (req, res, next) =>
    helpers.pipePP(
      R.pick(ideaService.members),  // let's remove any extra fields
      ideaService.validateForCreation,
      ideaService.decorateForCreation(req.user._id),
      ideaService.updateDoc(req.params.id),
      ideaService.sanitizeIdeaForDisplay
    )(req.body)
      .then(idea => res.json(idea))
      .then(next)
      .catch(mapExceptions(next))
  )

  /**
   * Retrieve a page of ideas.
   * The paging starts at 1 and is governed by a page query param.
   * https://small-project-api.herokuapp.com/api-docs#ideas-get-a-page-of-ideas-1-page-10-ideas-
   */
  app.get('/ideas', (req, res, next) => {
    let page = req.query.page ? Number.parseInt(req.query.page) : 1
    return helpers.pipePP(
      ideaService.validateForFetch,
      ideaService.fetchIdeas,
      R.map(ideaService.sanitizeIdeaForDisplay)
    )({user: req.user._id, page})
      .then(idea => res.json(idea))
      .then(next)
      .catch(mapExceptions(next))
  })
  /**
   * Delete an idea
   * https://small-project-api.herokuapp.com/api-docs#ideas-delete-idea
   */
  app.del('/ideas/:id', (req, res, next) =>
    helpers.pipePP(
      id => ideaStore.remove({_id: id})
    )(req.params.id)
      .then(() => res.send(''))
      .then(next)
      .catch(mapExceptions(next))
  )

  const mapExceptions = R.curry((next, err) => {
    let codez401 = ['AssertionError', 'Error']
    if (codez401.includes(err.constructor.name)) return next(new restify.errors.BadRequestError(err.message))
    next(err)
  })
}
