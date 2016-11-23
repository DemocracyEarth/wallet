import { Thread } from './Thread'
import { Wallet } from './Wallet'
import { faker } from 'faker'

const genKeyword = () => `${faker.address.country()} ${faker.address.state()} ${faker.company.companyName()}`

export const Contract = {
  type: 'object',
  properties: {
    ID: {
      type: 'string'
    },
    collectiveId: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    keyword: {
      type: 'string'
    },
    kind: {
      enum: [
        'DRAFT',
        'VOTE',
        'DELEGATION',
        'MEMBERSHIP'
      ]
    },
    context: {
      enum: [
        'GLOBAL',
        'LOCAL'
      ]
    },
    url: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    createdAt: {
      faker: 'date.past'
    },
    lastUpdate: {
      faker: 'date.past'
    },
    timestamp: {
      faker: 'date.past'
    },
    tags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
         _id: {
           type: 'string'
         },
         label: {
           type: 'string'
         },
         url: {
           type: 'string',
           faker: 'internet.url'
         },
         rank: {
           type: 'number'
         }
       },
       required: ['_id']
      }
    },
    membersOnly: {
      type: 'boolean'
    },
    executionStatus: {
      enum: [
        'OPEN',
        'APPROVED',
        'ALTERNATIVE',
        'REJECTED',
        'VOID'
      ]
    },
    anonymous: {
      type: 'boolean'
    },
    signatures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string'
          },
          username: {
            type: 'string'
          },
          role: {
            enum: [
              'AUTHOR',
              'DELEGATOR',
              'DELEGATE',
              'ENDORSER'
            ]
          },
          status: {
            enum: [
              'PENDING',
              'REJECTED',
              'CONFIRMED'
            ]
          },
          hash: {
            type: 'string'
          }
        },
        required: [
          '_id'
        ]
      }
    },
    closingDate: {
      faker: 'date.future'
    },
    alwaysOpen: {
      type: 'boolean'
    },
    allowForks: {
      type: 'boolean'
    },
    secretVotes: {
      type: 'boolean'
    },
    realtimeResults: {
      type: 'boolean'
    },
    multipleChoice: {
      type: 'boolean'
    },
    rankPreferences: {
      type: 'boolean'
    },
    executiveDecision: {
      type: 'boolean'
    },
    stage: {
      enum: [
        'DRAFT',
        'LIVE',
        'FINISH'
      ]
    },
    transferable: {
      type: 'boolean'
    },
    limited: {
      type: 'boolean'
    },
    portable: {
      type: 'boolean'
    },
    ballot: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
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
          'rank',
          'url'
        ]
      }
    },
    ballotEnabled: {
      type: 'boolean'
    },
    authorized: {
      type: 'boolean'
    },
    isDefined: {
      type: 'boolean'
    },
    isRoot: {
      type: 'boolean'
    },
    referrers: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    events: {
      type: 'array',
      items: Thread
    },
    wallet: Wallet,
    owner: {
      pattern: '^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$'
    }
  },
  required: [
    'ID',
    'title',
    'keyword',
    'kind',
    'context',
    'url',
    'description',
    'createdAt',
    'lastUpdate',
    'timestamp',
    'membersOnly',
    'executionStatus',
    'anonymous',
    'closingDate',
    'alwaysOpen',
    'allowForks',
    'secretVotes',
    'realtimeResults',
    'multipleChoice',
    'rankPreferences',
    'executiveDecision',
    'stage',
    'ballotEnabled',
    'authorized',
    'isDefined',
    'isRoot',
    'events',
    'wallet',
    'owner'
  ]
}
