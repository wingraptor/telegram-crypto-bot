const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

require("dotenv").config();


// // replace the value below with the Telegram token you receive from @BotFather
// const token = "1731872262:AAHV3Jf3-vdDYoaGhwuLv2JK4nqXg2js5Ns";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

async function getPriceData(cryptoSymbol){
  const cryptoSymbolUpperCased =  cryptoSymbol.toUpperCase()
  const CMCApiQueryOptions = {
    url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.X_CMC_PRO_API_KEY,
    },
    params: {
      symbol: cryptoSymbolUpperCased,
    },
    method:"get"
  };
  try {
    const data = await axios(CMCApiQueryOptions)
    const specificCryptoData = data.data.data[Object.keys(data.data.data)[0]];
    const currentPriceInUSD = specificCryptoData.quote.USD.price.toFixed(2);
    const percentageChange24hrs = specificCryptoData.quote.USD.percent_change_24h.toFixed(2);
    const name = specificCryptoData.name;
    const symbol = specificCryptoData.symbol;

    return {
      currentPriceInUSD,
      percentageChange24hrs,
      name,
      symbol
    };

  } catch (error) {
    return error;
  }
}


// Capture text (should be cryptosymbol) that proceeds after the command /price "
bot.onText(/\/price (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const cryptoSymbol = match[1]; // the captured "cryptoCode"

  const cryptoData = await getPriceData(cryptoSymbol);

  const message = `*${cryptoData.name} (${cryptoData.symbol})*: ${cryptoData.currentPriceInUSD} USD | ${cryptoData.percentageChange24hrs}% ${cryptoData.percentageChange24hrs > 0 ?  "increase" : "decrease"} no err- 24hr`;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, message, { parse_mode: "MARKDOWN" });
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });
