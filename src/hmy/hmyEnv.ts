import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '../constants'
import { Hmy } from './hmy'
import { Account } from './account'

export const { Contract } = require('@harmony-js/contract')

export class HmyEnv extends Hmy {
  accounts!: { [id: string]: Account } | null
  dotEnvSupported!: boolean

  constructor(network: string, gasLimit: number = DEFAULT_GAS_LIMIT, gasPrice: number = DEFAULT_GAS_PRICE) {
    let dotEnvSupport = false

    try {
      require('dotenv').config()

      let envGasLimit = process.env.GAS_LIMIT
      let envGasPrice = process.env.GAS_PRICE

      if (envGasLimit != null && envGasLimit !== '') {
        gasLimit = +envGasLimit;
      }
  
      if (envGasPrice != null && envGasPrice !== '') {
        gasPrice = +envGasPrice;
      }

      dotEnvSupport = true
    }
    catch (e) {}

    super(network, gasLimit, gasPrice)

    this.dotEnvSupported = dotEnvSupport

    if (this.dotEnvSupported) {
      this.setAccounts()
    }
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
