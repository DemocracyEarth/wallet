import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { Factory } from 'meteor/dburles:factory'
import { fakerSchema } from '../../utils/test-utils/faker-schema/'
import { Contracts } from './Contracts'


const { schema, generateDoc } = fakerSchema

Factory.define('contract', Contracts)

describe('contracts module', function() {
  beforeEach(function() {
    resetDatabase()
  })

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Contract)
    //console.log(testDoc)
    const contract = Factory.create('contract', testDoc)
  })
})
