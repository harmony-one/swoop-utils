import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '../constants'
import { Network } from './network'
import { Account } from './account'

export const { Contract } = require('@harmony-js/contract')

require('dotenv').config()

export class NetworkEnv extends Network {
  accounts!: { [id: string]: Account } | null

  constructor(network: string, envGasLimit: string | undefined = process.env.GAS_PRICE, envGasPrice: string | undefined  = process.env.GAS_LIMIT) {
    var gasLimit: number = DEFAULT_GAS_LIMIT;
    var gasPrice: number = DEFAULT_GAS_PRICE;

    if (envGasLimit != null && envGasLimit != '') {
      gasLimit = +envGasLimit;
    }

    if (envGasPrice != null && envGasPrice != '') {
      gasPrice = +envGasPrice;
    }

    super(network, gasLimit, gasPrice)

    this.setAccounts()
  }

  private setAccounts(): void {
    this.accounts = {
      deployer: {
        type: 'deployer',
        privateKey: process.env[`${this.network.toUpperCase()}_PRIVATE_KEY`],
      } as Account,

      tester: {
        type: 'tester',
        privateKey: process.env[`${this.network.toUpperCase()}_TEST_ACCOUNT_PRIVATE_KEY`],
      } as Account,
    }
  }

  public loadContract(path: string, address: string, privateKeyType: string): typeof Contract | null {
    let contract = null
    let privateKey = null

    switch (privateKeyType) {
      case 'deployer':
      case 'tester':
        privateKey = this.accounts?.[privateKeyType]?.privateKey
        break

      default:
        privateKey = privateKeyType
    }

    if (privateKey != null && privateKey != '') {
      contract = super.loadContract(path, address, privateKey)
    }

    return contract
  }
}
