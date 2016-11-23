import { Ballot } from './Ballot'

export const Wallet = {
  type: 'object',
  properties: {
    balance: {
      type: 'number',
      minimum: 0
    },
    placed: {
      type: 'number',
      minimum: 0
    },
    available: {
      type: 'number',
      minimum: 0
    },
    currency: {
      enum: [
        'BITCOIN',
        'SATOSHI',
        'VOTES'
      ]
    },
    address: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hash: {
            type: 'string'
          },
          collectiveId: {
            type: 'string'
          }
        }
      }
    },
    ledger: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          txId: {
            type: 'string'
          },
          quantity: {
            type: 'number'
          },
          entityId: {
            enum: [
              'BITCOIN',
              'SATOSHI',
              'VOTES'
            ]
          },
          ballot: {
            type: 'array',
            items: {
              type: Ballot
            }
          }
        }
      }
    }
  },
  required: [
    'balance',
    'placed',
    'available',
    'currency',
    'address',
    'ledger'
  ]
}
