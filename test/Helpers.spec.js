
const helpers = require('../lib/Helpers')
describe('Our Helpers', () => {
  describe('Required field validator', () => {
    it('tests for required fields', () => {
      global.expect(() => helpers.checkRequiredFields(['foo'], {})).to.throw('foo not found!')
    })
    it('tests for required fields passing', () => {
      global.expect(() => helpers.checkRequiredFields(['foo'], {foo: 0})).to.not.throw()
    })
    it('tests for numeric failing', () => {
      global.expect(() => helpers.checkCondition(Number.isInteger, 'not a number', ['foo'], {foo: '1'})).to.throw('foo not a number')
    })
    it('tests for numeric passing', () => {
      global.expect(() => helpers.checkCondition(Number.isInteger, 'not a number', ['foo', 'bar'], {foo: 0, bar: 1})).to.not.throw()
    })
  })

  /**
   * Copied in this code
   */

  const pipeP = helpers.pipePP
  describe('promise pipeline', () => {
    it('handles non promise based functions', () => {
      let f = _in => _in * 2
      return helpers.pipePP(f, f)(20)
        .then(res => res.should.equal(80))
    })
    it('handles a nice mix', () => {
      let f = _in => _in * 2
      let fp = _in => Promise.resolve(_in / 2)
      return pipeP(f, f, fp)(20)
        .then(res => res.should.equal(40))
    })
    it('handles an empty argument', () => {
      let f = _in => 20
      let fp = _in => Promise.resolve(_in / 2)
      return pipeP(f, fp)()
        .then(res => res.should.equal(10))
    })
  })
  const setAnything = helpers.setAnything
  describe('setAnything', () => {
    it('maps simple values', () => {
      let o = {foo: 1}
      setAnything('foo', o, 2)
      o.foo.should.equal(2)
    })
    it('merges objects', () => {
      let o = {foo: {1: 'one'}}
      setAnything('foo', o, {2: 'two'})
      o.foo.should.deep.equal({ '1': 'one', '2': 'two' })
    })
    it('merges objects', () => {
      let o = {foo: {1: 'one'}}
      setAnything('foo', o, 1)
      o.foo.should.equal(1)
    })
    it('is not broken by lists', () => {
      let o = {foo: [0, 1]}
      setAnything('foo', o, [3, 4])
      o.foo.should.deep.equal([3, 4])
    })
    it('is not broken by mixing lists with objects', () => {
      let o = {foo: {one: 1}}
      setAnything('foo', o, [3, 4])
      o.foo.should.deep.equal([3, 4])
    })
    it('is not broken by mixing lists with objects', () => {
      let o = {foo: [3, 4]}
      setAnything('foo', o, {one: 1})
      o.foo.should.deep.equal({one: 1})
    })
  })
  describe('Our ramda helpers', () => {
    it('maps properties', () => {
      const input = {firstName: 'Elisia', age: 22, type: 'human'}
      let res = helpers.renameKeys({firstName: 'name', type: 'kind', foo: 'bar'})(input)
      res.should.deep.equal({name: 'Elisia', age: 22, kind: 'human'})
    })
    it('preserves unmapped properties', () => {
      const input = {firstName: 'Elisia', age: 22, type: 'human', other: 'other'}
      let res = helpers.renameKeys({firstName: 'name', type: 'kind', foo: 'bar'})(input)
      res.should.deep.equal({name: 'Elisia', age: 22, kind: 'human', other: 'other'})
    })
    it('setP assigns some props returning the object', () => {
      let res = helpers.setP('id', 'two', {id: 'one', name: 'name1'})
      res.should.deep.equal({id: 'two', name: 'name1'})
    })
    it('setP assigns some props from a f returning the argument', () => {
      let res = helpers.setP('name', (_in) => 'foo', {id: 'one', name: 'name1'})
      res.should.deep.equal({id: 'one', name: 'foo'})
    })
  })
})
