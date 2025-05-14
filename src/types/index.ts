// 类型定义
export interface UserAsset {
  id?: number;
  address: string;
  network: string;
  type: "native" | "token" | "nft";
  contractAddress?: string;
  symbol?: string;
  name?: string;
  balance: string;
  tokenId?: string;
}

export interface AssetBalance {
  native: string;
  tokens: UserAsset[];
  nfts: UserAsset[];
}

export interface DBUserAsset {
  id?: number;
  address: string;
  network: string;
  type: "native" | "token" | "nft";
  contract_address?: string;
  symbol?: string;
  name?: string;
  balance: string;
  token_id?: string;
  created_at: Date;
  updated_at: Date;
}
