import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

const BOT_TOKEN = '7274912084:AAHXj4eIsT3v66MgaZz8NhKHG-7uu0P3axQ';
const GROUP_ID = -1002551206809;
const STOCK_URL = 'https://gagapii.onrender.com/api/stock/GetStock';

const bot = new Telegraf(BOT_TOKEN);

let lastStock = {
  seeds: null,
  gear: null,
  egg: null,
  cosmetic: null,
};

const categories = {
  seeds: '🌱 Семена',
  gear: '⚙️ Гиры',
  egg: '🥚 Яйца',
  cosmetic: '💄 Косметика'
};

function formatList(title, items) {
  if (!items?.length) return `• ${title}: <i>пусто</i>`;
  return `• ${title}:\n` + items.map(item => `  — ${item.name}${item.value ? ` (${item.value})` : ''}`).join('\n');
}

function isStockDifferent(oldStock, newStock) {
  if (!oldStock || !newStock) return true;
  return JSON.stringify(oldStock) !== JSON.stringify(newStock);
}

async function checkStockUpdates() {
  try {
    const res = await fetch(STOCK_URL);
    const data = await res.json();

    const updated = [];

    for (const key in lastStock) {
      const newData =
        key === 'seeds' ? data.seedsStock :
        key === 'gear' ? data.gearStock :
        key === 'egg' ? data.eggStock :
        key === 'cosmetic' ? data.cosmeticsStock : [];

      if (isStockDifferent(lastStock[key], newData)) {
        updated.push({ key, items: newData });
        lastStock[key] = newData;
      }
    }

    if (updated.length === 0) return;

    const message = `<b>📦 Обновлённый сток:</b>\n\n` +
      updated.map(({ key, items }) =>
        formatList(categories[key], items)
      ).join('\n\n');

    await bot.telegram.sendMessage(GROUP_ID, message, { parse_mode: 'HTML' });
    console.log('[✅] Обновление отправлено:', updated.map(u => u.key).join(', '));

  } catch (err) {
    console.error('[❌] Ошибка:', err.message);
  }
}

setInterval(checkStockUpdates, 60 * 1000);
bot.launch();
console.log('🤖 Бот следит за реальными изменениями стока...');
