import { config } from 'config'

const Web3 = require('web3');

export const getProvider = () => {
  const provider = new Web3.providers.WebsocketProvider(config.eth.infura)
  provider.on('connect', () => console.log('WS Connected'))
  provider.on('error', e => {
    console.error('WS Error', e)
    web3.setProvider(getProvider())
  })
  provider.on('end', e => {
    console.error('WS End', e)
    web3.setProvider(getProvider())
  })

  return provider
}

const web3 = new Web3(getProvider())