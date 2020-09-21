import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from './constants'

const { Harmony } = require('@harmony-js/core')
const { ChainID, ChainType } = require('@harmony-js/utils')
const { Contract } = require('@harmony-js/contract')

export class Network {
  client: typeof Harmony
  network: string
  url!: string
  explorerUrl!: string
  chainType: typeof ChainType
  chainId: typeof ChainID
  gasPrice: number
  gasLimit: number

  constructor(network: string, gasLimit: number = DEFAULT_GAS_LIMIT, gasPrice: number = DEFAULT_GAS_PRICE) {
    this.network = network.toLowerCase()
    this.gasPrice = gasLimit
    this.gasLimit = gasPrice

    this.setNetworkOptions()
    this.setClient()
  }

  private setNetworkOptions(): void {
    switch (this.network) {
      case 'localnet':
      case 'local':
        this.network = 'localnet'
        this.url = 'http://localhost:9500'
        this.explorerUrl = ''
        this.chainType = ChainType.Harmony
        this.chainId = ChainID.HmyLocal
        break

      case 'testnet':
        this.url = 'https://api.s0.b.hmny.io'
        this.explorerUrl = 'https://explorer.pops.one/#'
        this.chainType = ChainType.Harmony
        this.chainId = ChainID.HmyTestnet
        break

      case 'mainnet':
        this.url = 'https://api.s0.t.hmny.io'
        this.explorerUrl = 'https://explorer.harmony.one/#'
        this.chainType = ChainType.Harmony
        this.chainId = ChainID.HmyMainnet
        break

      default:
        console.log('Please enter a valid network - testnet or mainnet.')
        throw new Error('NetworkRequired')
    }
  }

  private setClient(): void {
    this.client = new Harmony(this.url, {
      chainType: this.chainType,
      chainId: this.chainId,
    })
  }

  public gasOptions(): any {
    return {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
    }
  }

  public getBech32Address(address: string): string {
    return this.client.client.crypto.getAddress(address).bech32
  }

  public getBase16Address(address: string): string {
    return this.client.client.crypto.fromBech32(address)
  }

  public async getBalance(address: string): Promise<number> {
    let res = await this.client.blockchain.getBalance({ address })
    let balanceHex = res && res.result
    let balance = this.client.utils.hexToNumber(balanceHex)
    return balance
  }

  public async getBlockNumber(): Promise<number> {
    let res = await this.client.blockchain.getBlockNumber()
    let currentBlockHex = res && res.result
    let currentBlockNumber = this.client.utils.hexToNumber(currentBlockHex)
    return currentBlockNumber
  }

  public loadContract(path: string, address: string, privateKey: string): typeof Contract | null {
    let contract = null

    if (privateKey != '') {
      const contractJson = require(path)
      contract = this.client.contracts.createContract(contractJson.abi, address)
      contract.wallet.addByPrivateKey(privateKey)
    }

    return contract
  }
}
