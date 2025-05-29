# Binance-DCA-Bot

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub stars](https://img.shields.io/github/stars/yourusername/binance-dca-bot.svg?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/binance-dca-bot.svg?style=social)

Binance-DCA-Bot 是一个用于在 Binance 交易所上实现美元成本平均法（Dollar Cost Averaging, DCA）策略的自动化工具。通过定期定额投资，该机器人帮助用户降低市场波动的影响，逐步建仓。

## 功能特性

- **自动化定投**：按照预设的时间间隔和金额自动执行买入订单。
- **多种策略支持**：支持基于技术指标的买入信号，如 RSI、MACD 等。
- **资金管理**：设置每次投资的金额或比例，控制风险。
- **Binance API 集成**：通过官方 API 与 Binance 交易所无缝连接。
- **日志记录**：详细记录每次操作，便于回溯和分析。
- **可定制化**：用户可以根据需求修改参数和策略。

## 安装步骤

### 前提条件

- Node.js 版本 >= 14.x
- Binance 账户和 API 密钥

### 安装

1. 克隆仓库到本地：
   ```bash
   git clone https://github.com/yourusername/binance-dca-bot.git
   cd binance-dca-bot
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. **配置环境变量（重要！）**：
   - 创建 `.env` 文件，并按照以下模板配置（请替换为您的实际值）：
     ```bash
     # Binance API 密钥和密码
     API_KEY=your_api_key_here
     API_SECRET=your_api_secret_here
     
     # Binance API URL
     BINANCE_API_URL=https://api.binance.com/api/v3
     
     # 每次定投的基础 USDT 金额
     BASE_USDT=50
     
     # 交易对列表，多个交易对用逗号分隔
     SYMBOLS=BTCUSDT,BNBUSDT,SUIUSDT
     ```
   > **注意**：请妥善保管您的 API 密钥和密码，切勿泄露给第三方！

4. 修改配置文件：
   - 编辑 `config.js` 文件，设置定投参数、交易对等。

### 运行

```bash
node index.js
```

## 使用方法

1. 配置好参数后，运行脚本，机器人将按照设定自动执行定投策略。
2. 可以通过日志文件查看每次操作的详细信息。
3. 如需停止运行，直接按 `Ctrl+C` 终止程序。

## 策略说明

- **定时定投**：目前项目固定在UTC+8时间每周五21:30进行定投。
- **指标触发**：项目每笔定投资金由当天币种的RSI智能决定。
- **分批建仓**：将资金分成多份，在不同价位逐步买入。

## 注意事项

- 本工具不构成投资建议，使用前请充分了解相关风险。
- 请妥善保管 API 密钥，不要泄露给第三方。
- 建议先在测试账户上运行，确认无误后再投入真实资金。

## 贡献指南

欢迎对本项目提出改进建议或贡献代码！请按照以下步骤操作：

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目基于 [MIT 许可证](LICENSE) 发布 - 详情请查看 LICENSE 文件。

## 联系方式

- 项目地址：[https://github.com/yourusername/binance-dca-bot](https://github.com/yourusername/binance-dca-bot)
- 问题反馈：请在 GitHub 上提交 Issue

感谢使用 Binance-DCA-Bot！