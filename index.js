require("dotenv").config();
const binanceApi = require("./binanceApi");
const indicators = require("./indicators");
const orderUtils = require("./orderUtils");
const cron = require("node-cron"); // 导入cron库，注释掉以备用
// const nodemailer = require('nodemailer');  // 导入nodemailer库，注释掉以备用

var rsiPeriod = 14; // 用户可以在这里配置RSI计算的周期长度
const baseUSDT = process.env.BASE_USDT; // 用户可以在这里配置每次定投的基础USDT数值，总投入
let rsiData = []; // 全局数组存储RSI数据
let accountInfo = null; // 全局变量存储账户信息

async function performDCA() {
  const symbols = process.env.SYMBOLS.split(',').map(symbol => symbol.trim());
  const numSymbols = symbols.length; // 币种数量
  const limit = rsiPeriod + 1; // 设置limit为rsiPeriod + 1，以确保有足够数据计算RSI
  rsiData = []; // 重置RSI数据

  // 先获取RSI数据
  for (const symbol of symbols) {
    const klineData = await binanceApi.getKlineData(symbol, "1d", limit);
    if (klineData && klineData.length > rsiPeriod) {
      const closes = klineData.map(candle => parseFloat(candle[4]));
      const rsi = indicators.calculateRSI(closes, rsiPeriod);
      if (rsi !== null) {
        rsiData.push({ symbol: symbol, rsi: rsi });
      } else {
        console.log(`Not enough data to calculate RSI for ${symbol}`);
      }
    } else {
      console.log(`Not enough data for ${symbol}`);
    }
  }

  // 获取账户信息
  accountInfo = await orderUtils.getAccountInfo();

  // 计算每个币种的实际投入
  const allocatedUSDT = baseUSDT / numSymbols; // 平均分配基础USDT
  for (const data of rsiData) {
    let actualInvestment = allocatedUSDT * (50 / data.rsi);
    if (actualInvestment < 5.1) {
      actualInvestment = 5.1;
    }
    console.log(
      `币种 ${data.symbol}：分配USDT：${allocatedUSDT.toFixed(
        2
      )}，RSI：${data.rsi.toFixed(2)}，实际投入：${actualInvestment.toFixed(
        2
      )} USDT`
    );
    //进行实际下单
    try {
      await orderUtils.placeOrder(data.symbol, actualInvestment);
      // console.log(
      //   `Successfully placed order for ${
      //     data.symbol
      //   } with amount ${actualInvestment.toFixed(2)} USDT`
      // );
    } catch (error) {
      console.error(`Failed to place order for ${data.symbol}:`, error);
    }
  }
}

function printNextDCATime() {
  // 计算并打印下次定投时间
  const now = new Date();
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7));
  nextFriday.setHours(21, 30, 0, 0);
  if (
    (now.getDay() === 5 && now.getHours() < 21) ||
    (now.getDay() === 5 && now.getHours() === 21 && now.getMinutes() < 30)
  ) {
    nextFriday.setDate(now.getDate());
  } else {
    nextFriday.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7));
  }
  console.log(
    "下次定投时间:",
    nextFriday.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
  );
}

async function main() {
  console.log("检查币安连接有效性");
  isConnect = binanceApi.testConnectivity();

  if (!isConnect) {
    throw new Error("无法连接币安服务器！");
  }
  console.log("连接有效！");
  console.log("定投程序开始运行");
  const symbols = process.env.SYMBOLS.split(',').map(symbol => symbol.trim());
  console.log("定投的币种（在env中配置）:", symbols.join(', '));
  // 在程序开始运行时调用一次获取账户信息
  await orderUtils.getAccountInfo();
  // 在程序开始运行时调用一次
  printNextDCATime();

  cron.schedule(
    "30 21 * * 5",
    () => {
      // 每周五21:30，UTC+8时区
      console.log("执行定投 at 21:30 UTC+8 on Friday");
      // 每次定投前调用获取账户信息
      orderUtils.getAccountInfo().then(() => {
        performDCA().then(() => {
          // 在每次定投执行后调用
          printNextDCATime();
        });
      });
    },
    {
      scheduled: true,
      timezone: "Asia/Shanghai", // UTC+8
    }
  );
}

main();
