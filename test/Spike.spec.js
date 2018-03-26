var jwt = require('jsonwebtoken')
let secretOrPrivateKey = 'shhhhhhared-secret'
// var token = jwt.sign({ foo: 'base' }, secretOrPrivateKey, { expiresIn: '110m' })
var token2 = jwt.sign({user: 'test'}, secretOrPrivateKey)

describe('A spike', () => {
  it('dones anything', () => {
    jwt.verify(token2, secretOrPrivateKey)
  })
})
