
const deps = global.appFactory.create(null)

let api = require('../lib/UserServices')(deps)

describe('Our UserServices', () => {
  it('validates a password', function () {
    api.isValidPassword('test').should.be.false()
    api.isValidPassword('testtest').should.be.false()
    api.isValidPassword('Testtest').should.be.false()
    api.isValidPassword('Testtes1').should.be.true()
    api.isValidPassword('Testtest1').should.be.true()
    api.isValidPassword('11111111').should.be.false()
  })

  it('validates an email', function () {
    api.isValidEmail('k').should.be.false()
    api.isValidEmail('a@a.com').should.be.true()
    api.isValidEmail('a@a.biz').should.be.true()
  })
})
