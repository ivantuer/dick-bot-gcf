require('dotenv').config()
const { Telegraf } = require("telegraf");
const { roll, top, me } = require("./user");

const {
  GOOGLE_CLOUD_PROJECT_ID,
  TELEGRAM_BOT_TOKEN,
  GOOGLE_CLOUD_REGION,
} = process.env;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
bot.start((ctx) => ctx.reply(`Welcome to the most silly bot you'll ever see`));

bot.help(async (ctx) => {
  ctx.reply(`/roll, /me, /top`);
});

bot.command("roll", roll);
bot.command("top", top);
bot.command("me", me);

// bot.launch();
// console.log("bot started");

bot.telegram.setWebhook(
  `https://${GOOGLE_CLOUD_REGION}-${GOOGLE_CLOUD_PROJECT_ID}.cloudfunctions.net/${process.env.FUNCTION_TARGET}`
);

exports.telegramBotWebhook = (req, res) => {
  bot.handleUpdate(req.body, res);
};
