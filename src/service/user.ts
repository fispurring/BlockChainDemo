async function auth(loginToken: string) {
  //时间关系，暂时不验证登录token
  return true;
}

/*
 * 获取账户地址
 * @param activity 用户活跃程度
 * @param networks 公链标识列表
 * @returns 用户地址列表
 */
async function getUserInfoList(
  activity: number,
  networks: string[]
): Promise<{ address: string; network: string }[]> {
  //时间关系，暂时不实现获取账户列表功能
  return [];
}

export default { auth, getUserInfoList };
