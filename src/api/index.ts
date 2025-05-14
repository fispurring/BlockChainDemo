import Router from "@koa/router";
import util from "../util";
import service from "../service";
import getAssets from "./getAssets";

function routes() {
  console.log("api routes begin");
  const router: Router = new Router();

  // 获取资产接口
  router.post("/get-assets", getAssets);

  return router.routes();
}

export default { routes };
