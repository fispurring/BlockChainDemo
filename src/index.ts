import Koa from "koa";
import bodyParser from "koa-bodyparser";
import api from "./api";
import 'source-map-support/register.js';
import service from "./service";

//捕获未处理的Promise异常
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// 捕获未处理的异常
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

service.init();

const app = new Koa();
app.use(bodyParser());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    //本demo所有错误的错误码都是-1，正式环境应采取更为规范的错误码定义
    ctx.body = {
      code: err.errCode ?? -1,
      message: err.message,
    };
  }
});

app.use(api.routes());
app.listen(3000);

