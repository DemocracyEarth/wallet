import { Wallet } from './Wallet'

export const DelegationContract = {
  type: 'object',
  properties: {
    collectiveId: {
      type: 'string',
    },
    delegatorId: {
      type: 'string'
    },
    contractId: {
      type: 'string'
    },
    votes: {
      type: 'number',
      minimum: 0
    },
    tags: {
      type: Array,
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string'
          },
          text: {
            type: 'string'
          }
        }
      }
    }
  }
}

export const Delegation = {
  received: {
    type: 'array',
    items: {
      type: DelegationContract
    }
  },
  sent: {
    type: 'array',
    items: {
      type: DelegationContract
    }
  }
}

export const Vote = {
  type: 'object',
  properties: {
    total: {
      type: 'number',
      minimum: 0
    },
    delegations: {
      type: Delegation
    },
    wallet: Wallet
  },
  required: [
    'total'
  ]
}
