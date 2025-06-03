const binanceApi = require('./binanceApi');
const logger = require('./logger');

async function placeOrder(symbol, usdtAmount) {
  // 首先获取币种当前价格
  const price = await binanceApi.getCurrentPrice(symbol);
  if (price === null) {
    logger.error(`无法获取 ${symbol} 当前价格`);
    return;
  }
  
  // 计算 quantity，为要买入的 USDT 价值 / 当前价格
  let quantity = usdtAmount / price;
  
  // 获取币种的 lotSize 信息
  const lotSize = await binanceApi.getLotSize(symbol);
  if (lotSize === null) {
    logger.error(`无法获取 ${symbol} 的 lotSize 信息`);
    return;
  }
  
  // 检查 quantity 是否大于该币种最低下单数量
  if (quantity > lotSize.minQty) {
    // 将 quantity 四舍五入至 lotSize.minQty 小数点后第一次出现非0数字的那一位
    let decimalPlaces = 0;
    const minQtyStr = lotSize.minQty.toString();
    const decimalPart = minQtyStr.split('.')[1] || "";
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] !== "0") {
        decimalPlaces = i + 1;
        break;
      }
    }
    const roundedQuantity = parseFloat(quantity.toFixed(decimalPlaces));
    
    // 使用 buyOrder 函数进行下单
    await binanceApi.buyOrder(symbol, roundedQuantity);
    logger.info(`已下单买入 ${symbol}，数量：${roundedQuantity}，价格：${price}`);
  } else {
    // 如果 quantity 小于该币种最低下单数量，提示用户
    logger.error(`quantity (${quantity}) 小于最低下单数量 (${lotSize.minQty})，无法下单。请检查或调整投资金额。`);
  }
}

async function getAccountInfo() {
  const accountInfo = await binanceApi.getAccountInfo();
  // 打印账户信息以验证，优化可读性，只输出 USDT 资产
  const usdtAsset = accountInfo.find(asset => asset.asset === 'USDT');
  if (usdtAsset) {
    logger.info(
      `资产: ${usdtAsset.asset}, 可用: ${usdtAsset.free}, 锁定: ${usdtAsset.locked}`
    );
  } else {
    logger.error("未找到 USDT 资产信息");
  }
  return accountInfo;
}

module.exports = { placeOrder, getAccountInfo };