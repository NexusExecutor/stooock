import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

const BOT_TOKEN = '7274912084:AAHXj4eIsT3v66MgaZz8NhKHG-7uu0P3axQ';
const GROUP_ID = -1002551206809;
const RESTOCK_URL = 'https://gagapii.onrender.com/api/stock/restock-time';
const STOCK_URL = 'https://gagapii.onrender.com/api/stock/GetStock';

const bot = new Telegraf(BOT_TOKEN);
const lastRestock = {};

async function checkRestocks() {
  try {
    const res = await fetch(RESTOCK_URL);
    const data = await res.json();

    const categories = {
      seeds: 'Семена',
      gear: 'Гиры',
      egg: 'Яйца',
      cosmetic: 'Косметика'
    };

    const updated = [];

    for (const key in categories) {
      const current = data[key]?.LastRestock;
      if (current && lastRestock[key] !== current) {
        updated.push(key);
        lastRestock[key] = current;
      }
    }

    if (updated.length === 0) return; // ничего не обновилось

    const stockRes = await fetch(STOCK_URL);
    const stockData = await stockRes.json();

    const formatList = (title, items) => {
      if (!items?.length) return `• ${title}: пусто`;
      return `• ${title}:\n` + items.map(item => `  — ${item.name}${item.value ? ` (${item.value})` : ''}`).join('\n');
    };

    const message =
      `📦 Обновлённый сток:\n\n` +
      updated.map(key => {
        const title = categories[key];
        const items =
          key === 'seeds' ? stockData.seedsStock :
          key === 'gear' ? stockData.gearStock :
          key === 'egg' ? stockData.eggStock :
          key === 'cosmetic' ? stockData.cosmeticsStock : [];

        return formatList(title, items);
      }).join('\n\n');

    await bot.telegram.sendMessage(GROUP_ID, message);
    console.log('Отправлено обновление:', updated.join(', '));
  } catch (err) {
    console.error('Ошибка при проверке или отправке:', err.message);
  }
}

setInterval(checkRestocks, 60 * 1000); // проверяем каждую минуту
bot.launch();
console.log('Бот запущен и следит за обновлениями');
