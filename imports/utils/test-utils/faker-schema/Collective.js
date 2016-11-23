import { Wallet } from './Wallet'

export const Country = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      faker: 'address.country'
    },
    code: {
      type: 'string',
      faker: 'address.countryCode'
    }
  },
  required: [
    'name',
    'code'
  ]
}

export const Jurisdiction = {
  type: 'object',
  properties: {
    legal: {
      type: 'object',
      properties: {
        taxId: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        type: {
          type: 'string'
        }
      },
      required: [
        'name'
      ]
    },
    location: {
      type: 'object',
      properties: {
        address: {
          type: 'string'
        },
        state: {
          type: 'string',
          faker: 'address.state'
        },
        country: {
          type: Country
        }
      }
    }
  }
}

export const CollectiveProfile = {
  type: 'object',
  properties: {
    website: {
      type: 'string',
      faker: 'internet.url'
    },
    bio: {
      type: 'string'
    },
    blockchain: {
      type: 'object',
      properties: {
        address: {
          type: 'string'
        }
      }
    },
    logo: {
      type: 'string'
    },
    jurisdiction: {
      type: Jurisdiction
    },
    foundation: {
      faker: 'date.past'
    },
    goal: {
      enum: ['Profit', 'Free']
    },
    owners: {
      type: 'string'
    },
    configured: {
      type: 'boolean'
    },
    wallet: Wallet
  },
}

export const Collective = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    domain: {
      type: 'string'
    },
    emails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            faker: 'internet.email'
          },
          verified: {
            type: 'boolean'
          }
        },
        required: [
          'address',
          'verified'
        ]
      }
    },
    profile: {
      type: CollectiveProfile
    },
    goal: {
      enum: ['Business', 'Free', 'Commons']
    },
    authorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'string'
          }
        }
      }
    }
  },
  required: [
    'name',
    'domain'
  ]
}
