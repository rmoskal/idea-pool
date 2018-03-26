const deps = global.appFactory.create(null)

let api = require('../lib/IdeaServices')(deps)

describe('Our idea services', () => {
  describe('the validators',
    () => {
      it('passes a good idea', () => {
        global.expect(() => api.validateForCreation({
          content: 'hey an idea',
          impact: 1,
          ease: 2,
          confidence: 1
        })).to.not.throw()
      })
      it('fails for a missing field', () => {
        global.expect(() => api.validateForCreation({
          impact: 1,
          ease: 2,
          confidence: 1
        })).to.throw('AssertionError: content not found!')
      })
      it('fails for a non-=numeric score', () => {
        global.expect(() => api.validateForCreation({
          content: 'hey an idea',
          impact: 1,
          ease: 2,
          confidence: 'a'
        })).to.throw('AssertionError: confidence not an integer')
      })
      it('fails for a score that is too low', () => {
        global.expect(() => api.validateForCreation({
          content: 'hey an idea',
          impact: 1,
          ease: 2,
          confidence: -5
        })).to.throw('AssertionError: confidence should be greater than 0 and less than 11')
      })
      it('fails for a score that is too hi', () => {
        global.expect(() => api.validateForCreation({
          content: 'hey an idea',
          impact: 1,
          ease: 2,
          confidence: 11
        })).to.throw('AssertionError: confidence should be greater than 0 and less than 11')
      })
      it('fails for contents that are too long', () => {
        global.expect(() => api.validateForCreation({
          content: new Array(300).join('a'),
          impact: 1,
          ease: 2,
          confidence: 1
        })).to.throw('AssertionError: content should be less than 256 characters')
      })
    })
})

  // ['content', 'impact', 'ease', 'confidence']
// .to.throw('AssertionError: content not found!')
