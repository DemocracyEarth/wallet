export const Ballot = {
  type: 'object',
  properties: {
    _id: {
      type: 'string'
    },
    mode: {
      type: 'string'
    },
    rank: {
      type: 'number'
    },
    url: {
      type: 'string',
      faker: 'internet.url'
    },
    label: {
      type: 'string'
    }
  },
  required: [
    '_id',
    'mode'
  ]
};
