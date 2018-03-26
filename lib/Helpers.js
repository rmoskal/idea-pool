const assert = require('assert')
const R = require('ramda')
const util = require('util')

const chain = (q, fn) => q.then(fn)

function pipePP (...fns) {
  if (fns.length < 1) {
    throw Error('pipe requires at least one argument')
  }

  fns.forEach((fn, i) => {
    if (typeof fn !== 'function') {
      throw Error(`pipe requires each argument to be a function. Argument #${i + 1} is of type "${typeof fn}"`)
    }
  })
  // shift out the 1st function for multiple arguments
  const start = fns.shift()
  return (...args) => fns.reduce(chain, new Promise(res => res(start(...args)))) // eslint-disable-line
}

const checkRequiredFields = R.curry(
  (fieldList, _in) => {
    fieldList.forEach(each => assert((_in[each] !== null && _in[each] !== undefined),
      `${each} not found!`))
    return _in
  }
)

const checkCondition = R.curry(
  (fn, msg, fieldList, _in) => {
    fieldList.forEach(each => assert((fn(_in[each])),
      `${each} ${msg}`))
    return _in
  }
)

function pLog (data) {
  console.log('>>>>', util.inspect(data, {depth: null, colors: true}))
  return data
}

const setP = R.curry((propertyName, value, obj) => {
  obj = Object.assign({}, obj)
  setAnything(propertyName, obj, value)
  return obj
})

function setAnything (propertyName, obj, value) {
  if (typeof value === 'function') { value = value(obj) }
  if (Array.isArray(obj[propertyName]) || Array.isArray(value)) { obj[propertyName] = value } else if (R.is(Object, obj[propertyName]) && R.is(Object, value)) { obj[propertyName] = Object.assign(obj[propertyName], value) } else { obj[propertyName] = value }
}

const renameKeys = R.curry((keysMap, obj) =>
  R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
)

module.exports = {
  pipePP,
  checkRequiredFields,
  checkCondition,
  pLog,
  setP,
  setAnything,
  renameKeys

}
