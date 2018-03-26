var jwt = require('jsonwebtoken')

const app = restify.createServer()
const deps = global.appFactory.create(app)
appFactory.bootRestify(restify, app)
const request = require('supertest')

// const helpers = require('../lib/Helpers')
require('../lib/Api')(deps)

/**
 * This is an integration test that save state.  Meaning you can't comment
 * out the earlier tests and expect the later ones to work
 */
describe('Our Api', () => {
  var token2 = jwt.sign({user: 'test'}, deps.config.JWT_SECRET)

  it('has a health check endpoint', () =>
    request(app).get('/test')
      .expect(200)
      .then(res => res.body.res.should.equal('ok'))
  )
  it('guards me an endpoint', () =>
    request(app).get('/me')
      .expect(401)
  )
  it('lets through a token', () =>
    request(app).get('/protectedtest')
      .set({'x-access-token': token2})
      .expect(200)
      .then(res => res.body.user.should.equal('test'))

  )

  it('fails for malformed input', () =>
    request(app).post('/users')
      .send({email: 'a@a.com', password: 'Texttext01'})
      .expect(400)
  )

  let token
  let refreshToken
  it('creates a user', () =>
    request(app).post('/users')
      .send({email: 'a@a.com', password: 'Texttext01', name: 'foo bar'})
      .expect(200)
      .then(res => {
        token = res.body.jwt
        let decoded = jwt.verify(res.body.jwt, deps.config.JWT_SECRET)
        global.expect(decoded.password).to.be.undefined() // Strip the pw
        let expiry = decoded.exp - decoded.iat
        expiry.should.equal(600)  // expires in 10 minutes
        refreshToken = res.body.refresh_token
        refreshToken.should.exist() // There is a refresh token
      })
  )

  it('fails with a 401 for bad password', () =>
    request(app).post('/access-tokens')
      .send({email: 'a@a.com', password: 'badx'})
      .expect(401)
      .then(res => {
        res.body.message.should.equal('Password does not match')
      })
  )

  it('fails with a 400 for a non-existent user', () =>
    request(app).post('/access-tokens')
      .send({email: 'foo', password: 'Texttext01'})
      .expect(400)
      .then(res => {
        res.body.message.should.equal('User not Found')
      })
  )

  let newRefreshToken

  it('logs in a user', () =>
    request(app).post('/access-tokens')
      .send({email: 'a@a.com', password: 'Texttext01'})
      .expect(200)
      .then(res => {
        res.body.jwt.should.exist()
        newRefreshToken = res.body.refresh_token
        newRefreshToken.should.exist()
        refreshToken.should.not.equal(res.body.refresh_token) // we should get a new refresh token
      })
  )

  it('fails with a 400 for malformed payload', () =>
    request(app).post('/access-tokens/refresh')
      .send({email: 'a@a.com', password: 'Texttext01'})
      .expect(400)
     .then(res => {
       res.body.message.should.equal('refresh_token not found!')
     })
  )

  it('refreshes my token', () =>
      request(app).post('/access-tokens/refresh')
        .send({refresh_token: newRefreshToken})
        .expect(200)
        .then(res => {
          res.body.jwt.should.exist()
          newRefreshToken = res.body.refresh_token
          newRefreshToken.should.exist()
          refreshToken.should.not.equal(res.body.refresh_token) // we should get a new refresh token
        })
  )

  it('the old token is invalid', () =>
      request(app).post('/access-tokens/refresh')
        .send({refresh_token: refreshToken})
        .expect(400)
        .then(res => res.body.message.should.equal('no user token'))
  )

  it('fails with duplicate email', () =>
    request(app).post('/users')
      .send({email: 'a@a.com', password: 'Texttext01', name: 'foo bar'})
      .expect(400)
      .then(res => res.body.message.should.equal("Can't insert key a@a.com, it violates the unique constraint"))
  )

  it('returns me from the database', () =>
    request(app).get('/me')
      .set({'x-access-token': token})
      .expect(200)
      .then(res => global.expect(res.body.password).to.be.undefined())
  )

  it('creates an idea', () =>
    request(app).post('/ideas')
      .set({'x-access-token': token})
      .send({content: 'foo', impact: 1, ease: 2, confidence: 3})
      .expect(200)
      .then(res => {
        res.body.id.should.exist()
        res.body.average_score.should.equal(2)
        res.body.created_at.should.exist()
        global.expect(res.body.user).to.be.undefined()
      })
  )

  let idea
  it('fetches ideas', () =>
    request(app).get('/ideas?page=1')
      .set({'x-access-token': token})
      .expect(200)
      .then(res => {
        res.body.length.should.equal(1)
        idea = res.body[0]
        idea.id.should.exist()
        global.expect(res.body.user).to.be.undefined()
      })
  )

  it('fails with a 0 page', () =>
    request(app).get('/ideas?page=0')
      .set({'x-access-token': token})
      .expect(400)
  )

  it('fails with a non-numeric  page', () =>
    request(app).get('/ideas?page=v')
      .set({'x-access-token': token})
      .expect(400)
  )

  it('updates an idea', () => {
    idea.content = 'algo nuevo'
    return request(app).put(`/ideas/${idea.id}`)
      .set({'x-access-token': token})
      .send(idea)
      .expect(200)
      .then(res => {
        res.body.content.should.equal('algo nuevo')
      })
  })

  it('fails to delete an idea without a token', () => {
    return request(app).del(`/ideas/${idea.id}`)
      .send(idea)
      .expect(401)
  })

  it('deletes an idea', () => {
    return request(app).del(`/ideas/${idea.id}`)
      .set({'x-access-token': token})
      .send(idea)
      .expect(200)
  })

  it('has no ideas left', () =>
    request(app).get('/ideas?page=1')
      .set({'x-access-token': token})
      .expect(200)
      .then(res => {
        res.body.length.should.equal(0)
      })
  )

  it("stops you from logging out if you aren't logged in", () =>
    request(app).del('/access-tokens')
      .send({refresh_token: newRefreshToken})
      .expect(401)
      .then(res => res.body.message.should.equal(''))
  )

  it('stops you from logging out without a token', () =>
    request(app).del('/access-tokens')
      .set({'x-access-token': token})
      .send({refresh_token: newRefreshToken})
      .expect(200)
      .then(res => res.body.should.equal(''))
  )

  it('prevents logout 2x', () =>
    request(app).del('/access-tokens')
      .set({'x-access-token': token})
      .send({refresh_token: newRefreshToken})
      .expect(400)
      .then(res => res.body.message.should.equal('no user token'))
  )
})
