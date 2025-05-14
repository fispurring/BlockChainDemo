import { Context } from "koa";
import storage from "../storage";
import { UserAsset, AssetBalance, DBUserAsset } from "../types";
import config from "../config";
import integration from "../integration";
import { Network } from "alchemy-sdk";
import _ from "lodash";

async function getAssets(
  assetInfoList: Array<{
    address: string;
    network: string;
  }>
): Promise<UserAsset[]> {
  //剔除重复的资产信息
  assetInfoList = _.uniqBy(assetInfoList, (item) => {
    return `${item.address}_${item.network}`;
  });

  let assets: UserAsset[] = [];
  for (const assetInfo of assetInfoList) {
    const { address, network } = assetInfo;
    // 检查缓存
    const cacheKey = `assets:${network}:${address}`;
    const cached = await storage.redis.get(cacheKey);
    if (cached) {
      console.debug("getAssets cache hit", cacheKey);
      assets.push(...JSON.parse(cached));
      return assets;
    }

    // 查询数据库
    const dbAssets = await storage
      .mysql<DBUserAsset>("assets")
      .where("address", address)
      .andWhere("network", network)
      .orderBy("updated_at", "desc");
    if (dbAssets.length > 0) {
      console.debug("getAssets db hit", cacheKey);
      await storage.redis.setex(
        cacheKey,
        config.get("REDIS_ASSET_CACHE_TTL"),
        JSON.stringify(dbAssets)
      );
      assets.push(
        ..._.map(dbAssets, (dbAsset) => ({
          address: dbAsset.address,
          network: dbAsset.network,
          type: dbAsset.type,
          contractAddress: dbAsset.contract_address,
          symbol: dbAsset.symbol,
          name: dbAsset.name,
          balance: dbAsset.balance,
          tokenId: dbAsset.token_id,
        }))
      );
      return assets;
    }

    // 调用Alchemy API
    const balances = await integration.alchemy.getBalances(
      network as Network,
      address
    );
    await updateStorageAssets(address, network, balances);

    return balances;
  }
}

async function updateAssets(
  assetInfoList: Array<{
    address: string;
    network: string;
  }>
) {
  //剔除重复的资产信息
  assetInfoList = _.uniqBy(assetInfoList, (item) => {
    return `${item.address}_${item.network}`;
  });
  for (const assetInfo of assetInfoList) {
    const { address, network } = assetInfo;
    const balances = await integration.alchemy.getBalances(
      network as Network,
      address
    );
    await updateStorageAssets(address, network, balances);
  }
}

async function updateStorageAssets(
  address: string,
  network: string,
  assets: UserAsset[]
) {
  console.debug(
    "updateStorageAssets",
    address,
    network,
    JSON.stringify(assets)
  );
  // 更新缓存
  const cacheKey = `assets:${network}:${address}`;
  await storage.redis.setex(
    cacheKey,
    config.get("REDIS_ASSET_CACHE_TTL"),
    JSON.stringify(assets)
  );

  // 更新数据库
  try {
    for (const asset of assets) {
      await storage
        .mysql<DBUserAsset>("assets")
        .insert({
          address: address,
          network: asset.network,
          type: asset.type,
          contract_address: asset.contractAddress,
          symbol: asset.symbol,
          name: asset.name,
          balance: asset.balance,
          token_id: asset.tokenId,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(["address", "network", "type", "contract_address"])
        .merge();
    }
  } catch (err) {
    console.error(`Failed to update native asset for address: ${address}`, err);
  }
}

async function init() {
  // 监听公链的转账事件
  // 应维护一个公链列表，时间关系，暂时只监听ETH相关公链
  integration.alchemy.watchTransfers(Network.ETH_MAINNET);
  // integration.alchemy.watchTransfers(Network.ETH_SEPOLIA);
  // integration.alchemy.watchTransfers(Network.ETH_HOLESKY);
  // integration.alchemy.watchTransfers(Network.ETH_HOODI);
}

export default { getAssets, updateAssets, init };
