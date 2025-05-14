import asset from "./asset";
import user from "./user";

async function init() {
  // 初始化服务
  await asset.init();
}

export default { asset, user, init };
