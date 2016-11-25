import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import { fakerSchema } from '../../utils/test-utils/faker-schema/';
import { Collectives } from './Collectives';

const { schema, generateDoc } = fakerSchema;

Factory.define('collective', Collectives);

describe('collectives module', function() {
  beforeEach(function() {
    resetDatabase()
  });

  // sanity check that jsf schema validaes ok
  it('inserts cleanly', function() {
    const testDoc = generateDoc(schema.Collective)
    //console.log(testDoc)
    const collective = Factory.create('collective', testDoc)
  });
});
