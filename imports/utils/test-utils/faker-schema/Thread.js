export const Thread = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    userId: {
      type: 'string',
    },
    action: {
      enum: [
        'COMMENT',
        'VOTE',
        'SORT',
        'REPLY'
      ]
    },
    children: {
      type: 'array',
      items: {
        type: Thread
      }
    },
    ballot: {
      type: 'array',
      items: {
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
          'mode',
          'rank'
        ]
      }
    },
    placedVotes: {
      type: 'number',
      minimum: 0
    },
    hasQuote: {
      type: 'boolean'
    },
    quote: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    sort: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          upvotes: {
            type: 'number',
            minimum: 0
          },
          downvotes: {
            type: 'number',
            minimum: 0
          },
          userId: {
            type:'string'
          }
        },
        required: [
          'upvotes',
          'downvotes',
          'userId'
        ]
      }
    },
    sortTotal: {
      type: 'number',
      minimum: 0
    },
    timestamp: {
      type: 'string',
      faker: 'date.past'
    },
    status: {
      enum: [
        'NEW',
        'VERIFIED',
        'PROCESSED'
      ]
    }
  },
  required: [
    'id',
    'action',
    'children',
    'content',
    'timestamp',
    'status'
  ]
}
