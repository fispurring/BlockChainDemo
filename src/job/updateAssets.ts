import { scheduleJob } from "node-schedule";
import storage from "../storage";
import service from "../service";
import _ from "lodash";

//这里的node-schedule只是示例，考虑到生产环境一般是多实例部署，因此考虑用xxl-job之类的分布式任务调度框架
function init() {
  // 活跃用户更新eth链资产
  scheduleJob("0 */5 * * * *", async () => {
    const netowrks = ["eth"];
    const activeUserInfoList = await service.user.getUserInfoList(1, netowrks);
    if (_.isEmpty(activeUserInfoList)) {
      return;
    }

    await service.asset.updateAssets(activeUserInfoList);
  });

  // 非活跃用户更新eth链资产
  scheduleJob("0 0 * * * *", async () => {
    const netowrks = ["eth"];
    const userInfoList = await service.user.getUserInfoList(1, netowrks);
    if (_.isEmpty(userInfoList)) {
      return;
    }

    await service.asset.updateAssets(userInfoList);
  });

  //可进一步按用户活跃度和公链优先级进行任务拆分
  //例如：
  //  活跃等级1用户更新优先级为1的公链资产任务
  //  活跃等级1用户更新优先级为2的公链资产任务
  //  活跃等级2用户更新优先级为1的公链资产任务
  //  ......
}

export default { init };
