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
  ]
}
