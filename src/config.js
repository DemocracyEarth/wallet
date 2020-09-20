export const config = {
  web: {
    explorer: 'https://etherscan.io',
    icons: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{{publicAddress}}/logo.png'
  },
  graph: {
    tokens: 'https://api.thegraph.com/subgraphs/name/protofire/token-registry',
    moloch: 'https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus',
    ens: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  },
  keys: {
    fortmatic: 'pk_live_0826872BC201129A',
  },
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
