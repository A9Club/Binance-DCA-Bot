const TI = require('technicalindicators');

/**
 * 计算相对强弱指数 (RSI)。
 * RSI 是一个动量振荡器，用于衡量价格变化的速度和幅度。
 *
 * @param {number[]} closes - 收盘价数组，每个元素是一个数字，表示特定时间点的收盘价。
 * @param {number} [period=14] - 计算 RSI 的周期，默认值为 14。
 * @returns {number} 返回最近的 RSI 值，范围在 0 到 100 之间。
 * @throws {Error} 如果输入数据无效，可能抛出错误。
 * @example
 * const closes = [100, 102, 101, 105, 104]; // 示例收盘价数组
 * const rsiValue = calculateRSI(closes);
 * console.log(rsiValue); // 输出计算得到的 RSI 值
 */
const calculateRSI = (closes, period = 14) => {
    const input = {
        values: closes,
        period: period
    };
    const rsiValues = TI.RSI.calculate(input);
    // RSI.calculate returns an array, the last element is the most recent RSI
    return rsiValues[rsiValues.length - 1];
};

module.exports = { calculateRSI };