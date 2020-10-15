export interface Account {
  type: string
  privateKey: string | null
  address?: string | null
  bech32Address?: string | null
}
