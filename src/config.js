export const config = {
  web: {
    explorer: 'https://etherscan.io',
    icons: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{{publicAddress}}/logo.png'
  },
  graph: {
    tokens: 'https://api.thegraph.com/subgraphs/name/protofire/token-registry',
    moloch: 'https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus',
    ens: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    maker: 'https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance',
    compound: 'https://github.com/protofire/compound-governance-subgraph'
  },
  keys: {
    fortmatic: 'pk_live_0826872BC201129A',
    analytics: 'UA-69508804-1'
  },
  protocol: [
    {
      tag: 'MAKER',
      contract: '0x9ef05f7f6deb616fd37ac3c959a2ddd25a54e4f5',
      graph: 'maker'
    },
    {
      tag: 'MOLOCH',
      graph: 'moloch'
    }
  ],
  component: {
    toggle: {
      checkedIcon: false,
      uncheckedIcon: false,
      height: 20,
      width: 42,
      onColor: '#01c190',
      activeBoxShadow: ''
    }
  }
}
