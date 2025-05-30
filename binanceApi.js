require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const logger = require('./logger');

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const BINANCE_API_URL = process.env.BINANCE_API_URL;

/**
 * 生成 Binance API 签名。
 * 使用 HMAC-SHA256 算法对查询字符串进行签名。
 *
 * @param {string} queryString - 需要签名的查询字符串。
 * @returns {string} 返回签名字符串。
 * @example
 * const query = 'timestamp=123456789';
 * const signature = getSignature(query);
 * logger.info(signature); // 输出签名结果
 */
function getSignature(queryString) {
    return crypto.createHmac('sha256', API_SECRET).update(queryString).digest('hex');
}

/**
 * 获取 Binance 账户信息。
 * 包括过滤掉余额为零的资产。
 *
 * @returns {Array} 返回账户余额数组，每个元素包含 free 和 locked 等字段。
 * @throws {Error} 如果 API 调用失败，可能抛出错误。
 * @example
 * async function main() {
 *     const balances = await getAccountInfo();
 * logger.info(balances);
 * }
 */
async function getAccountInfo() {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = getSignature(queryString);
    try {
        const response = await axios.get(`${BINANCE_API_URL}/account`, {
            params: {
                timestamp: timestamp,
                signature: signature
            },
            headers: {
                'X-MBX-APIKEY': API_KEY
            }
        });
        // 过滤余额为零的资产
        const balances = response.data.balances.filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0);
        return balances;
    } catch (error) {
        logger.error('获取账户信息错误：', error.response.data.msg);
    }
}

/**
 * 获取 Binance K 线数据。
 * 从 Binance API 获取指定 symbol 的 K 线数据。
 *
 * @param {string} symbol - 交易对符号，例如 'BTCUSDT'。
 * @param {string} [interval='1d'] - K 线间隔，默认 '1d' (一天)。
 * @param {number} [limit=14] - 返回的数据点数量，默认 14。
 * @returns {Array} 返回 K 线数据数组，每个元素是一个数组 [openTime, open, high, low, close, volume, ...]。
 * @throws {Error} 如果 API 调用失败，可能抛出错误。
 * @example
 * async function main() {
 *     const data = await getKlineData('BTCUSDT', '1h', 100);
 * logger.info(data);
 * }
 */
async function getKlineData(symbol, interval = '1d', limit = 14) {  // 使limit参数可配置，默认值14
    try {
        const response = await axios.get(`${BINANCE_API_URL}/klines`, {
            params: {
                symbol: symbol,
                interval: interval,
                limit: limit
            }
        });
        return response.data;
    } catch (error) {
        logger.error(`获取K线数据错误 for ${symbol}:`, error.response.data.msg);
    }
}

/**
 * 获取 Binance 当前价格。
 * 从 Binance API 获取指定 symbol 的当前价格。
 *
 * @param {string} symbol - 交易对符号，例如 'BTCUSDT'。
 * @returns {number|null} 返回当前价格，如果失败返回 null。
 * @throws {Error} 如果 API 调用失败，可能抛出错误。
 * @example
 * async function main() {
 *     const price = await getCurrentPrice('BTCUSDT');
 *     if (price !== null) {
 * logger.info(`当前价格：${price}`);
 *     }
 * }
 */
async function getCurrentPrice(symbol) {  // 新添加函数获取当前价格
    try {
        const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
            params: {
                symbol: symbol
            }
        });
        return parseFloat(response.data.price);  // 返回价格作为浮点数
    } catch (error) {
        logger.error(`获取当前价格错误 for ${symbol}:`, error.response.data.msg);
        return null;  // 返回null表示错误
    }
}

/**
 * 执行 Binance 买入订单。
 * 使用市场价格买入指定数量的资产。
 *
 * @param {string} symbol - 交易对符号，例如 'BTCUSDT'。
 * @param {number} quantity - 买入数量。
 * @returns {object|null} 返回订单执行结果，如果失败返回 null。
 * @throws {Error} 如果 API 调用失败，可能抛出错误。
 * @example
 * async function main() {
 *     const result = await buyOrder('BTCUSDT', 0.001);
 *     if (result) {
 * logger.info('买入成功：', result);
 *     }
 * }
 */
async function buyOrder(symbol, quantity) {
    const timestamp = Date.now();
    const queryString = `symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
    const signature = getSignature(queryString);
    try {
        const response = await axios.post(`${BINANCE_API_URL}/order`, null, {
            params: {
                symbol: symbol,
                side: 'BUY',
                type: 'MARKET',
                quantity: quantity,
                timestamp: timestamp,
                signature: signature
            },
            headers: {
                'X-MBX-APIKEY': API_KEY
            }
        });
        // console.log('买入订单执行：', response.data);
        return response.data;
    } catch (error) {
        logger.error('买入订单错误：', error.response.data.msg);
    }
}

/**
 * 获取 Binance LOT_SIZE 过滤器信息。
 * 用于获取交易对的最小交易量步长等信息。
 *
 * @param {string} symbol - 交易对符号，例如 'BTCUSDT'。
 * @returns {object|null} 返回 LOT_SIZE 过滤器对象，如果失败返回 null。
 * @throws {Error} 如果 API 调用失败，可能抛出错误。
 * @example
 * async function main() {
 *     const lotSize = await getLotSize('BTCUSDT');
 *     if (lotSize) {
 * logger.info('LOT_SIZE:', lotSize);
 *     }
 * }
 */
async function getLotSize(symbol) {
    try {
        const response = await axios.get(`${BINANCE_API_URL}/exchangeInfo`, {
            params: {
                symbol: symbol
            }
        });
        // 查找指定 symbol 的信息
        const symbolInfo = response.data.symbols.find(s => s.symbol === symbol);
        if (symbolInfo) {
            // 查找 LOT_SIZE 过滤器
            const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
            if (lotSizeFilter) {
                return lotSizeFilter;  // 返回 LOT_SIZE 对象
            } else {
                throw new Error('未找到 LOT_SIZE 过滤器');
            }
        } else {
            throw new Error('未找到指定 symbol');
        }
    } catch (error) {
        logger.error(`获取 LOT_SIZE 错误 for ${symbol}:`, error.response.data.msg);
        return null;
    }
}

/**
 * 测试 Binance 服务器连通性。
 * 如果能连通则返回 true，不能连通则返回 false。
 *
 * @returns {boolean} 返回 true 如果连通，false 如果不能连通。
 * @example
 * async function main() {
 *     const connected = await testConnectivity();
 * logger.info(connected ? 'Connected' : 'Not connected');
 * }
 */
async function testConnectivity() {
    try {
        await axios.get(`${BINANCE_API_URL}/time`);
        return true;
    } catch (error) {
        logger.error('Connectivity test failed:', error.response.data.msg);
        return false;
    }
}
module.exports = { getAccountInfo, getKlineData, getCurrentPrice, buyOrder, getLotSize,testConnectivity };