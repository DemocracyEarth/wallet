export const config = {
  web: {
    explorer: 'https://etherscan.io/address/{{publicAddress}}',
    icons: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{{publicAddress}}/logo.png'
  },
  graph: {
    tokens: 'https://api.thegraph.com/subgraphs/name/protofire/token-registry',
    moloch: 'https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus',
    ens: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  },
  eth: {
    infura: 'wss://mainnet.infura.io/ws/v3/269a4106080549898dcc50dbb84754f3'
  },
  poh: {
    api: 'https://api.poh.dev/',
    profile: 'https://api.poh.dev/profiles/{{publicAddress}}',
    history: 'https://api.poh.dev/profiles/{{publicAddress}}/status-history',
    vouches: 'https://api.poh.dev/profiles/{{publicAddress}}/vouches',
    status: 'https://api.poh.dev/status',
    ping: 'https://api.poh.dev/ping'
  },
  keys: {
    fortmatic: 'pk_live_0826872BC201129A',
    portis: '5e0569f8-ac4b-47ed-a2c6-469ceeccf696',
    analytics: 'UA-69508804-1'
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
