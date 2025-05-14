import service from "../service";
import util from "../util";
import { Rules } from "async-validator";

const descriptor: Rules = {
  loginToken: {
    type: "string",
    required: true,
  },
  assets: {
    type: "array",
    required: true,
    min: 1,
    defaultField: {
      type: "object",
      required: true,
      fields: {
        network: {
          type: "string",
          required: true,
        },
        address: {
          type: "string",
          required: true,
        },
      },
    },
  },
};

export default async function (ctx: any) {
  const reqBody = ctx.request.body;

  await util.validator.validate(descriptor, reqBody);

  const { assets, loginToken } = reqBody;

  // 验证登录token
  await service.user.auth(loginToken);

  ctx.body = {
    code: 0,
    data: await service.asset.getAssets(assets),
  };
}
