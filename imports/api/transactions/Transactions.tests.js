import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Transactions } from './Transactions';

const { schema, generateDoc } = fakerSchema;

Factory.define('transaction', Transactions);

describe('transactions module', function () {
  beforeEach(function () {
    resetDatabase();
  })

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Transaction);
    //console.log(testDoc)
    console.log(`const transaction = Factory.create('transaction', testDoc);`);
    const transaction = Factory.create('transaction', testDoc);
  })
})
