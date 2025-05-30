// 使用 fetch API 每10秒获取价格并更新页面
showPrice()

setInterval(async () => {
  showPrice()
}, 10000); // 每10秒更新一次

// 在页面加载时初始化价格显示区域
document.addEventListener('DOMContentLoaded', () => {
  const priceDiv = document.createElement('div');
  priceDiv.id = 'prices';
  document.body.appendChild(priceDiv); // 添加一个 div 来显示价格
});

async function showPrice(){
  try {
    const response = await fetch('/api/prices');
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    const prices = await response.json();
    const priceDiv = document.getElementById('prices');
    if (priceDiv) {
      priceDiv.innerHTML = ''; // 清空现有内容
      for (const [symbol, price] of Object.entries(prices)) {
        const p = document.createElement('p');
        p.textContent = `${symbol} 当前价格: ${price} USDT`;
        priceDiv.appendChild(p);
      }
    }
  } catch (error) {
    console.error('获取价格错误:', error);
  }
}