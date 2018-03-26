process.env.NODE_ENV = 'test'
global.chai = require('chai')
let dirtyChai = require('dirty-chai')
global.chai.use(dirtyChai)
global.expect = require('chai').expect
global.should = require('chai').should()
global.chai.use(require('chai-things'))
global.assert = require('chai').assert
global.sinon = require('sinon')
global.chai.use(require('sinon-chai'))
global.chai.use(require('chai-as-promised'))
global.fs = require('fs')
global.path = require('path')
global.restify = require('restify')
global.appFactory = require('../lib/AppFactory')
