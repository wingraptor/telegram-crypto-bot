const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

require("dotenv").config();

// // replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Get News Query Results
async function getNews(searchQuery) {
  let endPoint = "everything";
  let params = {
    qInTitle: searchQuery,
    sortBy: "publishedAt",
    pageSize: 5,
    language: "en",
  };
  let articles = [];
  const newsAPIQueryOptions = {
    url: `https://newsapi.org/v2/${endPoint}`,
    headers: {
      "X-Api-Key": process.env.NEWS_API,
    },
    params,
    method: "get",
  };

  try {
    const response = await axios(newsAPIQueryOptions);
    articles = response.data.articles;
    return articles;
  } catch (error) {
    return error;
  }
}

async function getCryptoData(cryptoSymbol, command) {
  const cryptoSymbolUpperCased = cryptoSymbol.toUpperCase();
  let endPoint = "";
  let params = {};
  let data = {};

  if (
    command === "priceData" ||
    command === "infoData" ||
    command === "lambo"
  ) {
    endPoint = "/v1/cryptocurrency/quotes/latest";
    params = {
      symbol: cryptoSymbolUpperCased,
    };
  }

  const CMCApiQueryOptions = {
    url: `https://pro-api.coinmarketcap.com${endPoint}`,
    headers: {
      "X-CMC_PRO_API_KEY": process.env.X_CMC_PRO_API_KEY,
    },
    params,
    method: "get",
  };

  try {
    data = await axios(CMCApiQueryOptions);
  } catch (error) {
    return error;
  }

  if (command === "priceData") {
    const specificCryptoData = data.data.data[Object.keys(data.data.data)[0]];
    const currentPriceInUSD = specificCryptoData.quote.USD.price.toLocaleString(
      {
        maximumFractionDigits: 4,
      }
    );
    const percentageChange24hrs =
      specificCryptoData.quote.USD.percent_change_24h.toFixed(2);
    const name = specificCryptoData.name;
    const symbol = specificCryptoData.symbol;
    return {
      currentPriceInUSD,
      percentageChange24hrs,
      name,
      symbol,
    };
  } else if (command === "infoData") {
    const specificCryptoData = data.data.data[Object.keys(data.data.data)[0]];
    const currentMarketCap =
      specificCryptoData.quote.USD.market_cap.toLocaleString({
        maximumFractionDigits: 2,
      });
    const volume24hr = specificCryptoData.quote.USD.volume_24h.toLocaleString({
      maximumFractionDigits: 2,
    });
    const circulatingSupply =
      specificCryptoData.circulating_supply.toLocaleString({
        maximumFractionDigits: 2,
      });
    const percentageChange1hr =
      specificCryptoData.quote.USD.percent_change_1h.toLocaleString({
        maximumFractionDigits: 2,
      });
    const percentageChange24hr =
      specificCryptoData.quote.USD.percent_change_24h.toLocaleString({
        maximumFractionDigits: 2,
      });
    const percentageChange7days =
      specificCryptoData.quote.USD.percent_change_7d.toLocaleString({
        maximumFractionDigits: 2,
      });
    const position = specificCryptoData.cmc_rank;
    const currentPriceInUSD = specificCryptoData.quote.USD.price.toLocaleString(
      {
        maximumFractionDigits: 4,
      }
    );
    const name = specificCryptoData.name;
    const symbol = specificCryptoData.symbol;
    return {
      currentMarketCap,
      volume24hr,
      circulatingSupply,
      name,
      symbol,
      currentPriceInUSD,
      percentageChange1hr,
      percentageChange24hr,
      percentageChange7days,
      position,
    };
  } else if (command === "lambo") {
    const specificCryptoData = data.data.data[Object.keys(data.data.data)[0]];
    const currentPriceInUSD = specificCryptoData.quote.USD.price.toFixed(2);
    const coinsForLambo = Math.round(500000 / currentPriceInUSD);
    const symbol = specificCryptoData.symbol;
    return {
      coinsForLambo,
      symbol,
    };
  }
}

/* GET PRICE DATA FOLLOWING A '/price [cryptosymbol]' COMMAND */
// Capture text (should be cryptosymbol e.g eth or ETH) that proceeds after the command /price "
bot.onText(/\/price (.+)/, async (msg, match) => {
  // message is message being sent to person querying bot
  let message = "Sumn nuh right";
  let command = "priceData";
  let error = "";
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const cryptoSymbol = match[1]; // the captured "cryptoCode"

  const cryptoData = await getCryptoData(cryptoSymbol, command);

  if (cryptoData === error) {
    message = "Error...try again loser";
  }

  message = `*${cryptoData.name} (${cryptoData.symbol})*: ${
    cryptoData.currentPriceInUSD
  } USD | ${cryptoData.percentageChange24hrs}% ${
    cryptoData.percentageChange24hrs > 0 ? "increase" : "decrease"
  } (24hr)`;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, message, { parse_mode: "MARKDOWN" });
});

//--------------------------------------------------------------------//

/* GET CRYPTO INFO FOLLOWING A '/info [cryptosymbol]' COMMAND */
// Capture text (should be cryptosymbol e.g eth or ETH) that proceeds after the command /price "
bot.onText(/\/info (.+)/, async (msg, match) => {
  // message is message being sent to person querying bot
  let message = "Sumn nuh right";
  let command = "infoData";
  let error = "";
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const cryptoSymbol = match[1]; // the captured "cryptoCode"

  const cryptoData = await getCryptoData(cryptoSymbol, command);

  if (cryptoData === error) {
    message = "Error...try again loser";
  }

  message = `*${cryptoData.name} (${cryptoData.symbol})*:
 $${cryptoData.currentPriceInUSD} 
 *Cap*: $${cryptoData.currentMarketCap}
 *Position*: ${cryptoData.position}
 *Vol (24hr):* $${cryptoData.volume24hr}
 *1hr*: ${cryptoData.percentageChange1hr}%
 *24hr*: ${cryptoData.percentageChange24hr}%
 *7d*: ${cryptoData.percentageChange7days}%
 *Circulating Supply*: ${cryptoData.circulatingSupply} coins`;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, message, { parse_mode: "MARKDOWN" });
});

//--------------------------------------------------------------------//

/* GET CRYPTO INFO FOLLOWING A '/lambo [cryptosymbol]' COMMAND */
// Capture text (should be cryptosymbol e.g eth or ETH) that proceeds after the command /price "
bot.onText(/\/lambo (.+)/, async (msg, match) => {
  // message is message being sent to person querying bot
  let message = "Sumn nuh right";
  let command = "lambo";
  let error = "";
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const cryptoSymbol = match[1]; // the captured "cryptoCode"

  const cryptoData = await getCryptoData(cryptoSymbol, command);

  if (cryptoData === error) {
    message = "Error...try again loser";
  }

  message = `You need ${cryptoData.coinsForLambo} ${cryptoData.symbol} to buy a Lambo   ???????????????`;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, message, { parse_mode: "MARKDOWN" });
});

//--------------------------------------------------------------------//

/* GET News INFO FOLLOWING A '/news [searchQuery]' COMMAND */
bot.onText(/\/news (.+)/, async (msg, match) => {
  let error = "";
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const searchQuery = match[1]; // the captured "cryptoCode"
  // message is message being sent to person querying bot
  let message = `*Latest Headlines For ${searchQuery}*`;

  const articles = await getNews(searchQuery);

  // console.log(searchQuery + "1");

  articles.forEach((article) => {
    message += `

*${article.source.name}*: ${article.title} - ${article.url}
    `;
  });

  // console.log(message);

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
