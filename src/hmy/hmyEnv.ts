import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '../constants'
import { Hmy } from './hmy'
import { Account } from './account'
import { Contract } from '@harmony-js/contract'

import * as dotenv from "dotenv"

export class HmyEnv extends Hmy {
  accounts!: { [id: string]: Account } | null

  constructor(network: string, gasLimit: number = DEFAULT_GAS_LIMIT, gasPrice: number = DEFAULT_GAS_PRICE) {
    dotenv.config()
    let envGasLimit = process.env.GAS_LIMIT
    let envGasPrice = process.env.GAS_PRICE

    if (envGasLimit != null && envGasLimit !== '') {
      gasLimit = Number(envGasLimit)
    }

    if (envGasPrice != null && envGasPrice !== '') {
      gasPrice = Number(envGasPrice)
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
