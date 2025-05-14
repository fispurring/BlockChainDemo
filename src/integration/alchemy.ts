import {
  Network,
  Alchemy,
  TokenMetadataResponse,
  AlchemySubscription,
} from "alchemy-sdk";
import { UserAsset } from "../types";
import service from "../service";
import config from "../config";
import _ from "lodash";
import storage from "../storage";
import { RateLimiterMemory } from "rate-limiter-flexible";

const alchemyMap = new Map<Network, Alchemy>();

const opts = {
  points: 1, 
  duration: 5, 
};

const rateLimiter = new RateLimiterMemory(opts);

function getAlchemy(network: Network): Alchemy {
  try {
    if (!alchemyMap.has(network)) {
      const alchemy = new Alchemy({
        apiKey: config.get("ALCHEMY_API_KEY"),
        network,
      });
      alchemyMap.set(network, alchemy);
    }
    return alchemyMap.get(network)!;
  } catch (error) {
    console.error("Error getting Alchemy instance:", error);
    throw error;
  }
}

async function getTokenMetadata(
  network: Network,
  contractAddress: string
): Promise<TokenMetadataResponse> {
  console.debug("alchemy.getTokenMetadata", network, contractAddress);

  const cacheKey = `token_metadata:${contractAddress}`;

  // 检查缓存
  const cachedMetadata = storage.memory.get(cacheKey);
  if (cachedMetadata) {
    return cachedMetadata;
  }

  // 如果缓存中没有，从链上获取
  const alchemy = getAlchemy(network);
  const metadata = await alchemy.core.getTokenMetadata(contractAddress);

  // 缓存结果
  storage.memory.set(cacheKey, metadata);
  return metadata;
}

async function getBalances(
  network: Network,
  address: string
): Promise<UserAsset[]> {
  console.debug("alchemy.getBalances", network, address);
  let assets: UserAsset[] = [];

  const alchemy = getAlchemy(network);
  // 获取原生资产余额
  const [native, tokens, nfts] = await Promise.all([
    alchemy.core.getBalance(address),
    alchemy.core.getTokenBalances(address),
    alchemy.nft.getNftsForOwner(address),
  ]);

  assets.push({
    network,
    address,
    type: "native",
    balance: _.toString(native),
  });

  if (!_.isEmpty(tokens.tokenBalances)) {
    for (const token of tokens.tokenBalances) {
      const metadata = await getTokenMetadata(network, token.contractAddress);
      assets.push({
        network,
        address,
        type: "token",
        symbol: metadata.symbol,
        name: metadata.name,
        balance: token.tokenBalance ?? "0",
        contractAddress: token.contractAddress,
      });
    }
  }

  if (!_.isEmpty(nfts.ownedNfts)) {
    for (const nft of nfts.ownedNfts) {
      assets.push({
        network,
        address,
        type: "nft",
        name: nft.name,
        balance: nft.balance,
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
      });
    }
  }

  return assets;
}

function watchTransfers(network: Network) {
  console.debug("alchemy.watchTransfers", network);
  // 监听交易
  // hashesOnly = false
  // {
  //   "jsonrpc": "2.0",
  //   "method": "eth_subscription",
  //   "params": {
  //     "result": {
  //             "removed": false
  //             "transaction": {
  //           "blockHash":"0xbe847be2bceb74e660daf96b3f0669d58f59dc9101715689a00ef864a5408f43",
  //                 "blockNumber":"0x5b8d80",
  //                 "hash":"0xa8f2cf69e302da6c8100b80298ed77c37b6e75eed1177ca22acd5772c9fb9876",
  //                 "from":"0x2a9847093ad514639e8cdec960b5e51686960291",
  //                 "gas":"0x4f588",
  //                 "gasPrice":"0xc22a75840",
  //                 "input":"0x000101d521928b4146",
  //                 "nonce":"0x9a2",
  //                 "r":"0xb5889c55a0ebbf86627524affc9c4fdedc4608bee7a0f9880b5ec965d58e4264",
  //                 "s":"0x2da32e817e2483ec2199ec0121b93384ac820049a75e11b40d152fc7558a5d72",
  //                 "to":"0xc7ed8919c70dd8ccf1a57c0ed75b25ceb2dd22d1",
  //                 "transactionIndex":"0x14",
  //                 "type":"0x0",
  //                 "v":"0x1c",
  //                 "value":"0x0"
  //             }
  //     },
  //     "subscription": "0xf13f7073ddef66a8c1b0c9c9f0e543c3"
  //   }
  // }
  const alchemy = getAlchemy(network);
  alchemy.ws.on(
    {
      method: AlchemySubscription.MINED_TRANSACTIONS,
      hashesOnly: false,
    },
    async (msg: {
      transaction: { from: string; to: string; value: string };
    }) => {
      let passRateLimiter = false;
      //MINED_TRANSACTIONS量太大了，演示不需要那么大的量
      await rateLimiter
        .consume(1)
        .then(() => {
          passRateLimiter = true;
        })
        .catch(() => {
          passRateLimiter = false;
          console.log("Rate limit exceeded");
        });
      if (!passRateLimiter) {
        return;
      }
      console.log("Transfer detected:", JSON.stringify(msg));
      // 更新相关地址余额
      // 时间关系这里复用查询更新的方式实现
      // 从alchemy文档可以看出消息体有交易金额，但没有合约地址，正式项目可以尝试往增量更新的方向实现
      await Promise.all([
        service.asset.updateAssets([
          { address: msg.transaction.from, network },
          { address: msg.transaction.to, network },
        ]),
      ]);

      //TODO:
      // 生产环境应该将最新的资产变更推送到客户端，
      // 本demo不做session长连接管理，只使用客户端轮询的方式来更新数据
    }
  );
}

export default {
  getBalances,
  watchTransfers,
};
