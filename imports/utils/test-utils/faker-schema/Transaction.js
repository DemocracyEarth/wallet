import { Ballot } from './Ballot';

export const Ticket = {
  type: 'object',
  properties: {
    entityId: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    entityType: {
      enum: [
        'INDIVIDUAL',
        'COLLECTIVE',
        'CONTRACT',
        'UNKNOWN'
      ]
    },
    quantity: {
      type: 'number',
      minimum: 0
    },
    currency: {
      enum: [
        'BITCOIN',
        'SATOSHI',
        'VOTES'
      ]
    }
  },
  required: [
    'entityId',
    'address',
    'entityType',
    'quantity',
    'currency'
  ]
}

export const Transaction = {
  type: 'object',
  properties: {
    input: Ticket,
    output: Ticket,
    kind: {
      enum: [
        'VOTE',
        'DELEGATION',
        'MEMBERSHIP',
        'UNKNOWN'
      ]
    },
    contractId: {
      type: 'string'
    },
    timestamp: {
      type: 'string',
      faker: 'date.past'
    },
    condition: {
      type: 'object',
      properties: {
        expiration: {
          type: 'string',
          faker: 'date.future'
        },
        transferable: {
          type: 'boolean'
        },
        portable: {
          type: 'boolean'
        },
        ballot: {
          type: 'array',
          items: {
            type: Ballot
          }
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                enum: [
                  'PENDING',
                  'REJECTED',
                  'CONFIRMED'
                ]
              }
            },
            required: [
              'status'
            ]
          }
        }
      },
      required: [
        'expiration',
        'transferable',
        'portable'
      ]
    }
  },
  required: [
    'input',
    'output'
  ]
};
