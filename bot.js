import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

const BOT_TOKEN = '7274912084:AAHXj4eIsT3v66MgaZz8NhKHG-7uu0P3axQ';
const GROUP_ID = -1002551206809;  // ID твоей группы
const API_URL = 'https://gagapii.onrender.com/stock';

const bot = new Telegraf(BOT_TOKEN);

async function sendStock() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const text = "📦 Сток:\n" + data.items.map(item => `• ${item}`).join('\n');
    await bot.telegram.sendMessage(GROUP_ID, text);
  } catch (e) {
    console.error('Ошибка при отправке стока:', e.message);
  }
}

setInterval(sendStock, 60 * 60 * 1000); // каждый час

bot.launch();
console.log('Бот запущен');
