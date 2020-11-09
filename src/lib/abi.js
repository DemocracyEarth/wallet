export const abiLibrary = {
  moloch: [
    {
      constant: true,
      inputs: [],
      name: 'processingReward',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: 'memberAddress',
          type: 'address',
        },
        {
          name: 'proposalIndex',
          type: 'uint256',
        },
      ],
      name: 'getMemberProposalVote',
      outputs: [
        {
          name: '',
          type: 'uint8',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'getCurrentPeriod',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      name: 'members',
      outputs: [
        {
          name: 'delegateKey',
          type: 'address',
        },
        {
          name: 'shares',
          type: 'uint256',
        },
        {
          name: 'exists',
          type: 'bool',
        },
        {
          name: 'highestIndexYesVote',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSharesRequested',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'newDelegateKey',
          type: 'address',
        },
      ],
      name: 'updateDelegateKey',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalShares',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      name: 'proposalQueue',
      outputs: [
        {
          name: 'proposer',
          type: 'address',
        },
        {
          name: 'applicant',
          type: 'address',
        },
        {
          name: 'sharesRequested',
          type: 'uint256',
        },
        {
          name: 'startingPeriod',
          type: 'uint256',
        },
        {
          name: 'yesVotes',
          type: 'uint256',
        },
        {
          name: 'noVotes',
          type: 'uint256',
        },
        {
          name: 'processed',
          type: 'bool',
        },
        {
          name: 'didPass',
          type: 'bool',
        },
        {
          name: 'aborted',
          type: 'bool',
        },
        {
          name: 'tokenTribute',
          type: 'uint256',
        },
        {
          name: 'details',
          type: 'string',
        },
        {
          name: 'maxTotalSharesAtYesVote',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      name: 'memberAddressByDelegateKey',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'gracePeriodLength',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'abortWindow',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'getProposalQueueLength',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'summoningTime',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'votingPeriodLength',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'sharesToBurn',
          type: 'uint256',
        },
      ],
      name: 'ragequit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'proposalDeposit',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: 'startingPeriod',
          type: 'uint256',
        },
      ],
      name: 'hasVotingPeriodExpired',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'applicant',
          type: 'address',
        },
        {
          name: 'tokenTribute',
          type: 'uint256',
        },
        {
          name: 'sharesRequested',
          type: 'uint256',
        },
        {
          name: 'details',
          type: 'string',
        },
      ],
      name: 'submitProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256',
        },
        {
          name: 'uintVote',
          type: 'uint8',
        },
      ],
      name: 'submitVote',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          name: 'highestIndexYesVote',
          type: 'uint256',
        },
      ],
      name: 'canRagequit',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'guildBank',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'dilutionBound',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'periodDuration',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'approvedToken',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256',
        },
      ],
      name: 'abort',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256',
        },
      ],
      name: 'processProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'summoner',
          type: 'address',
        },
        {
          name: '_approvedToken',
          type: 'address',
        },
        {
          name: '_periodDuration',
          type: 'uint256',
        },
        {
          name: '_votingPeriodLength',
          type: 'uint256',
        },
        {
          name: '_gracePeriodLength',
          type: 'uint256',
        },
        {
          name: '_abortWindow',
          type: 'uint256',
        },
        {
          name: '_proposalDeposit',
          type: 'uint256',
        },
        {
          name: '_dilutionBound',
          type: 'uint256',
        },
        {
          name: '_processingReward',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'proposalIndex',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'delegateKey',
          type: 'address',
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address',
        },
        {
          indexed: true,
          name: 'applicant',
          type: 'address',
        },
        {
          indexed: false,
          name: 'tokenTribute',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'sharesRequested',
          type: 'uint256',
        },
      ],
      name: 'SubmitProposal',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'delegateKey',
          type: 'address',
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address',
        },
        {
          indexed: false,
          name: 'uintVote',
          type: 'uint8',
        },
      ],
      name: 'SubmitVote',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256',
        },
        {
          indexed: true,
          name: 'applicant',
          type: 'address',
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address',
        },
        {
          indexed: false,
          name: 'tokenTribute',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'sharesRequested',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'didPass',
          type: 'bool',
        },
      ],
      name: 'ProcessProposal',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address',
        },
        {
          indexed: false,
          name: 'sharesToBurn',
          type: 'uint256',
        },
      ],
      name: 'Ragequit',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'applicantAddress',
          type: 'address',
        },
      ],
      name: 'Abort',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address',
        },
        {
          indexed: false,
          name: 'newDelegateKey',
          type: 'address',
        },
      ],
      name: 'UpdateDelegateKey',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'summoner',
          type: 'address',
        },
        {
          indexed: false,
          name: 'shares',
          type: 'uint256',
        },
      ],
      name: 'SummonComplete',
      type: 'event',
    },
  ],
  moloch2: [
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'proposals',
      outputs: [
        {
          name: 'applicant',
          type: 'address'
        },
        {
          name: 'proposer',
          type: 'address'
        },
        {
          name: 'sponsor',
          type: 'address'
        },
        {
          name: 'sharesRequested',
          type: 'uint256'
        },
        {
          name: 'lootRequested',
          type: 'uint256'
        },
        {
          name: 'tributeOffered',
          type: 'uint256'
        },
        {
          name: 'tributeToken',
          type: 'address'
        },
        {
          name: 'paymentRequested',
          type: 'uint256'
        },
        {
          name: 'paymentToken',
          type: 'address'
        },
        {
          name: 'startingPeriod',
          type: 'uint256'
        },
        {
          name: 'yesVotes',
          type: 'uint256'
        },
        {
          name: 'noVotes',
          type: 'uint256'
        },
        {
          name: 'details',
          type: 'string'
        },
        {
          name: 'maxTotalSharesAndLootAtYesVote',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'processingReward',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'memberAddress',
          type: 'address'
        },
        {
          name: 'proposalIndex',
          type: 'uint256'
        }
      ],
      name: 'getMemberProposalVote',
      outputs: [
        {
          name: '',
          type: 'uint8'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getCurrentPeriod',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'members',
      outputs: [
        {
          name: 'delegateKey',
          type: 'address'
        },
        {
          name: 'shares',
          type: 'uint256'
        },
        {
          name: 'loot',
          type: 'uint256'
        },
        {
          name: 'exists',
          type: 'bool'
        },
        {
          name: 'highestIndexYesVote',
          type: 'uint256'
        },
        {
          name: 'jailed',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'token',
          type: 'address'
        },
        {
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'withdrawBalance',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'memberToKick',
          type: 'address'
        },
        {
          name: 'details',
          type: 'string'
        }
      ],
      name: 'submitGuildKickProposal',
      outputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'sharesToBurn',
          type: 'uint256'
        },
        {
          name: 'lootToBurn',
          type: 'uint256'
        }
      ],
      name: 'ragequit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'approvedTokens',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'newDelegateKey',
          type: 'address'
        }
      ],
      name: 'updateDelegateKey',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'TOTAL',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256'
        }
      ],
      name: 'processWhitelistProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'totalShares',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'proposalQueue',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'proposedToKick',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'memberAddressByDelegateKey',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'tokens',
          type: 'address[]'
        },
        {
          name: 'amounts',
          type: 'uint256[]'
        },
        {
          name: 'max',
          type: 'bool'
        }
      ],
      name: 'withdrawBalances',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        },
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'userTokenBalances',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'applicant',
          type: 'address'
        },
        {
          name: 'sharesRequested',
          type: 'uint256'
        },
        {
          name: 'lootRequested',
          type: 'uint256'
        },
        {
          name: 'tributeOffered',
          type: 'uint256'
        },
        {
          name: 'tributeToken',
          type: 'address'
        },
        {
          name: 'paymentRequested',
          type: 'uint256'
        },
        {
          name: 'paymentToken',
          type: 'address'
        },
        {
          name: 'details',
          type: 'string'
        }
      ],
      name: 'submitProposal',
      outputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'token',
          type: 'address'
        }
      ],
      name: 'collectTokens',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'totalLoot',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'gracePeriodLength',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'user',
          type: 'address'
        },
        {
          name: 'token',
          type: 'address'
        }
      ],
      name: 'getUserTokenBalance',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'tokenWhitelist',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getTokenCount',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getProposalQueueLength',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'summoningTime',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'votingPeriodLength',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'proposalDeposit',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'startingPeriod',
          type: 'uint256'
        }
      ],
      name: 'hasVotingPeriodExpired',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      name: 'sponsorProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          name: 'uintVote',
          type: 'uint8'
        }
      ],
      name: 'submitVote',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'totalGuildBankTokens',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'highestIndexYesVote',
          type: 'uint256'
        }
      ],
      name: 'canRagequit',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'dilutionBound',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      name: 'getProposalFlags',
      outputs: [
        {
          name: '',
          type: 'bool[6]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'periodDuration',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'depositToken',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'proposalCount',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'memberToKick',
          type: 'address'
        }
      ],
      name: 'ragekick',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      name: 'cancelProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'proposedToWhitelist',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256'
        }
      ],
      name: 'processGuildKickProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'proposalIndex',
          type: 'uint256'
        }
      ],
      name: 'processProposal',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'ESCROW',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'GUILD',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'tokenToWhitelist',
          type: 'address'
        },
        {
          name: 'details',
          type: 'string'
        }
      ],
      name: 'submitWhitelistProposal',
      outputs: [
        {
          name: 'proposalId',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          name: '_summoner',
          type: 'address'
        },
        {
          name: '_approvedTokens',
          type: 'address[]'
        },
        {
          name: '_periodDuration',
          type: 'uint256'
        },
        {
          name: '_votingPeriodLength',
          type: 'uint256'
        },
        {
          name: '_gracePeriodLength',
          type: 'uint256'
        },
        {
          name: '_proposalDeposit',
          type: 'uint256'
        },
        {
          name: '_dilutionBound',
          type: 'uint256'
        },
        {
          name: '_processingReward',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'summoner',
          type: 'address'
        },
        {
          indexed: false,
          name: 'tokens',
          type: 'address[]'
        },
        {
          indexed: false,
          name: 'summoningTime',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'periodDuration',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'votingPeriodLength',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'gracePeriodLength',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'proposalDeposit',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'dilutionBound',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'processingReward',
          type: 'uint256'
        }
      ],
      name: 'SummonComplete',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'applicant',
          type: 'address'
        },
        {
          indexed: false,
          name: 'sharesRequested',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'lootRequested',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'tributeOffered',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'tributeToken',
          type: 'address'
        },
        {
          indexed: false,
          name: 'paymentRequested',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'paymentToken',
          type: 'address'
        },
        {
          indexed: false,
          name: 'details',
          type: 'string'
        },
        {
          indexed: false,
          name: 'flags',
          type: 'bool[6]'
        },
        {
          indexed: false,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'delegateKey',
          type: 'address'
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        }
      ],
      name: 'SubmitProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'delegateKey',
          type: 'address'
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'startingPeriod',
          type: 'uint256'
        }
      ],
      name: 'SponsorProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'delegateKey',
          type: 'address'
        },
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'uintVote',
          type: 'uint8'
        }
      ],
      name: 'SubmitVote',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'didPass',
          type: 'bool'
        }
      ],
      name: 'ProcessProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'didPass',
          type: 'bool'
        }
      ],
      name: 'ProcessWhitelistProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalIndex',
          type: 'uint256'
        },
        {
          indexed: true,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'didPass',
          type: 'bool'
        }
      ],
      name: 'ProcessGuildKickProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'sharesToBurn',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'lootToBurn',
          type: 'uint256'
        }
      ],
      name: 'Ragequit',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amountToCollect',
          type: 'uint256'
        }
      ],
      name: 'TokensCollected',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'proposalId',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'applicantAddress',
          type: 'address'
        }
      ],
      name: 'CancelProposal',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'newDelegateKey',
          type: 'address'
        }
      ],
      name: 'UpdateDelegateKey',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'memberAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'Withdraw',
      type: 'event'
    }
  ]
}
