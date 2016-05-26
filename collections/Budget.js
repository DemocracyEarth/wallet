Schema.Transaction = new SimpleSchema({
  input: {
    type: Array,
    optional: true
  },
  "input.$": {
    type: Object,
    optional: true
  },
  "input.$.address": {
    type: String
  },
  "input.$.hashType": {
    type: Number
  },
  "input.$.txid": {
    type: Number
  },
  "input.$.inputIndex": {
    type: Boolean
  },
  "input.$.height": {
    type: Number
  },
  "input.$.confirmations": {
    type: String
  },
  output: {
    type: Array,
    optional: true
  },
  "output.$": {
    type: Object
  },
  "output.$.address": {
    type: String
  },
  "output.$.hashType": {
    type: String
  },
  "output.$.txid": {
    type: String
  },
  "output.$.outputIndex": {
    type: String
  },
  "output.$.height": {
    type: String
  },
  "output.$.satoshis": {
    type: String
  },
  "output.$.script": {
    type: String
  },
  "output.$.confirmations": {
    type: String
  }
});

Schema.Budget =  new SimpleSchema({
  funds: {
    type: Number,
    optional: true
  },
  total: {
    type: Object
  },
  "total.input": {
    type: String,
    optional: true
  },
  "total.output": {
    type: String,
    optional: true
  },
  currency: {
    type: String,
    allowedValues: ['Bitcoin', 'Satoshi'],
    optional: true
  },
  address: {
    type: String,
    optional: true
  },
  transactions: {
    type: Array,
    optional: true
  },
  "transactions.$": {
    type: Schema.Transaction,
    optional: true
  }
});

export default Schema.Budget;
