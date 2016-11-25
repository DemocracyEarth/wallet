import { Meteor } from 'meteor/meteor';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Tags } from './Tags';

const { schema, generateDoc } = fakerSchema;

Factory.define('tag', Tags);

describe('tags module', function() {
  beforeEach(function() {
    resetDatabase();
  });

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Tag)
    console.log(testDoc)
    const tag = Factory.create('tag', testDoc);
  });
});
