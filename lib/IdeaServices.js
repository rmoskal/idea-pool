const R = require('ramda')
const helpers = require('./Helpers')

module.exports = function (deps) {
  const ideaStore = deps.ideaStore
  const ideaMembers = ['content', 'impact', 'ease', 'confidence']

  function fetchIdeas ({user, page}) {
    let skip = 10 * (page - 1)
    return ideaStore.cfind({user: user}).sort({created_at: -1}).skip(skip).limit(10).exec()
  }

  const updateDoc = R.curry((id, doc) =>
    ideaStore.update({_id: id}, doc, {returnUpdatedDocs: true}
    ).then(res => R.tail(res)[0]) // The update call sends back an array! Looks like this [1, {}]
  )

  function validateForCreation (_in) {
    return R.pipe(
      helpers.checkRequiredFields(ideaMembers),
      testLessThan255Char(['content']),
      testNumeric(['impact', 'ease', 'confidence']),
      testBetween1And10(['impact', 'ease', 'confidence'])
    )(_in)
  }

  function validateForFetch (_in) {
    return R.pipe(
      testNumeric(['page']),
      greaterThan0(['page'])
    )(_in)
  }

  const decorateForCreation = R.curry((userId, _in) =>
    R.pipe(
      helpers.setP('average_score', _in => (_in.impact + _in.ease + _in.confidence) / 3),
      helpers.setP('created_at', Date.now),
      helpers.setP('user', userId)
    )(_in)
  )

  const testNumeric = helpers.checkCondition(Number.isInteger, 'not an integer')
  const greaterThan0 = helpers.checkCondition(R.identity, 'should be greater than 0 and less than 11')
  const testBetween1And10 = helpers.checkCondition(_in => _in > 0 && _in < 11, 'should be greater than 0 and less than 11')
  const testLessThan255Char = helpers.checkCondition(_in => _in.length < 256, 'should be less than 256 characters')

  function sanitizeIdeaForDisplay (idea) {
    return R.pipe(
      helpers.renameKeys({_id: 'id'}),
      R.dissoc('user')
    )(idea)
  }

  return {
    validateForCreation,
    decorateForCreation,
    fetchIdeas,
    updateDoc,
    validateForFetch,
    sanitizeIdeaForDisplay,
    members: ideaMembers
  }
}
