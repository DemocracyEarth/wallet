import { Wallet } from './Wallet';
import { Country } from './Collective';

export const Credential = {
  type: 'object',
  properties: {
    source: {
      enum: ['facebook', 'twitter', 'linkedin', 'github', 'peer'],
    },
    URL: {
      faker: 'internet.url'
    },
    validated: {
      type: 'boolean'
    }
  }
};

export const Menu = {
  type: 'object',
  properties: {
    feed: 'all',
    lastView: {
      faker: 'date.past'
    },
    newItems: {
      type: 'number',
      minimum: 0
    }
  }
};

export const Profile = {
  type: 'object',
  properties: {
    firstName: {
      faker: 'name.firstName',
    },
    lastName: {
      faker: 'name.lastName'
    },
    picture: {
      faker: 'image.imageUrl'
    },
    country: Country,
    birthday: {
      faker: 'date.past'
    },
    gender: {
      enum: ['Male', 'Female']
    },
    organization : {
      faker: 'company.companyName'
    },
    website: {
      faker: 'internet.url'
    },
    bio: {
      type: 'string'
    },
    configured: {
      type: 'boolean',
    },
    credentials: {
      type: 'array',
      items: {
        type: Credential
      }
    },
    url: {
      faker: 'internel.url'
    },
    menu: {
      type: 'array',
      items: {
        type: Menu
      }
    },
    wallet: Wallet
  }
};

export const User = {
  type: 'object',
  properties: {
    username: {
      faker: 'internet.userName'
    },
    emails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          address: {
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
    registered_emails: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    createdAt: {
      faker: 'date.past'
    },
    profile: {
      type: Profile
    },
    services: {
      type: 'object'
    },
    roles: {
      type: 'object'
    },
    roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    heartbeat: {
      faker: 'date.past'
    }
  },
  required: ['createdAt']
};
