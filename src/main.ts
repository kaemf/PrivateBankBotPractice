// PrivateBank Bot Practive University Work
// Developed by Yaroslav Volkivskyi (TheLaidSon)

// Actual v0.0.2

// Main File

import { q_a } from "./data/qa";
import { inlineApprovePayment } from "./data/paymentKeyboards";
import exchangeRateS from "./base/exchangeRate";
import { botVersion, about } from "./base/sysinfo";
import formattedName from "./base/nameProcess";
import { CheckException } from "./base/check";
import ExchangeRate, { Values } from "./data/valuesData";
import { convertToNameRateExchange } from "./data/convertRateExchange";
import keyboards from "./data/keyboards";
import arch from "./base/architecture";
import DateRecord from "./data/date";
import script from "./data/script";
import { Markup } from "telegraf";

async function main() {
  const [ onTextMessage, onContactMessage, , bot, db ] = await arch();

  //Begin bot work, collecting user data (his telegram name)
  bot.start((ctx) => {
    const set = db.set(ctx?.chat?.id ?? -1);
    console.log('\n\nBOT STARTED');
    ctx.reply(script.entire.greeting, {reply_markup: { remove_keyboard: true }});

    const username = ctx.chat.type === "private" ? ctx.chat.username ?? null : null;
    set('username')(username ?? 'unknown');
    db.get(ctx.chat.id)('registration-date')
      .then((value : string | number | undefined) => {
        if (value === null || value === undefined) {
          db.set(ctx.chat.id)('registration-date')(DateRecord());
        }
      })
      .catch((error) => {
        console.error(error);
    });
    set('state')('WaitingForName');
  });

  bot.command('menu', async (ctx) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    console.log(await exchangeRateS.convertRateToTarget('USD', 'Українська гривня', 500));

    ctx.reply(script.entire.functionEntire, {
      parse_mode: "Markdown",
      reply_markup: {
        one_time_keyboard: true,
        keyboard: keyboards.menu(),
      },
    });
    await set('state')('FunctionRoot');
  })
  
  //Get real user name and root to menu
  onTextMessage('WaitingForName', async (ctx, user, data) => {
    if (CheckException.TextException(data)){
      const name = formattedName(data.text),
        set = db.set(ctx?.chat?.id ?? -1);
      
      console.log(`Name: ${name}`)
      await set('state')('AskingForPhoneNumber');
  
      await set('name')(name);
  
      await ctx.reply(script.entire.thanksOnStart(name));
      await ctx.reply(script.entire.phoneRequire, {
        parse_mode: "Markdown",
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.sharePhone(),
        },
      });
      await set('state')('AskingForPhoneNumber');
    }
    else{
      ctx.reply(script.error.classicTextError);
    }
  });

  //Get user phone number with using funciion of getting
  onContactMessage('AskingForPhoneNumber', async (ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    if (CheckException.PhoneException(data)){
      set('phone_number')(data.phone_number);
  
      await ctx.reply(script.entire.thanksForComplet(1234))
  
      await ctx.reply(script.entire.functionEntire, {
        parse_mode: "Markdown",
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.menu(),
        },
      });
      await set('state')('FunctionRoot');
    }
    else{
      await ctx.reply(script.error.phoneError, {
        parse_mode: "Markdown",
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.sharePhone(),
        },
      });
    }
  });

  onTextMessage('FunctionRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    await set('recording-date')(DateRecord());

    switch(data.text){
      case "Баланс та історія транзакцій":
        ctx.reply("В розробці...", {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        })
        break;

      case "Валюти":
        ctx.reply(script.values.entire, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valuesMenu()
          }
        })

        await set('state')('ValuesMenuHandlerAndRoot');
        break;

      case "Лайв підтримка":
        ctx.reply("В розробці...", {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        })
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        break;
    }
  });

  onTextMessage('ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Курси валют":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state0);
        let response = '';
        for (let i = 0; i < 10; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu()
          }
        });
        await set('state')('_ValuesMenuHandlerAndRoot')
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valuesMenu(),
          },
        });
        break;
    }
  })

  onTextMessage('_ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Більше ->":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state1);
        let response = '';
        for (let i = 10; i < 20; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu()
          }
        });
        await set('state')('__ValuesMenuHandlerAndRoot')
        break;

      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
    }
  })

  onTextMessage('__ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Більше ->":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state2);
        let response = '';
        for (let i = 20; i < 40; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu()
          }
        });
        await set('state')('___ValuesMenuHandlerAndRoot')
        break;

      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
    }
  })

  onTextMessage('___ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Більше ->":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state3);
        let response = '';
        for (let i = 40; i < 70; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu()
          }
        });
        await set('state')('____ValuesMenuHandlerAndRoot')
        break;

      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
    }
  })

  onTextMessage('____ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Більше ->":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state4);
        let response = '';
        for (let i = 70; i < 110; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu()
          }
        });
        await set('state')('_____ValuesMenuHandlerAndRoot')
        break;
      
      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
    }
  })

  onTextMessage('_____ValuesMenuHandlerAndRoot', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "Більше ->":
        const messageToDelete = await ctx.reply(script.values.exchangeAllLoad.state5);
        let response = '';
        for (let i = 100; i <= 161; i++){
          response += `${script.values.valueData(`${ExchangeRate[i].flag} ${convertToNameRateExchange(ExchangeRate[i].code)}`, 
          await exchangeRateS.getSpecificRates('UAH', convertToNameRateExchange(ExchangeRate[i].code)), 'UAH', i)}\n`
        }

        ctx.deleteMessage(messageToDelete.message_id);
        ctx.reply(response, {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(true)
          }
        });
        await set('state')('EndFunctionManager')
        break;

      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      default:
        await ctx.reply(script.error.errorExceptionFunction, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
      
    }
  })

  

  onTextMessage('EndFunctionManager', async(ctx, user, data) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    switch(data.text){
      case "В МЕНЮ":
        ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
        await set('state')('FunctionRoot');
        break;

      case "❔ Про Бота":
        ctx.reply(about(botVersion), {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.endRootMenu()
          }
        });
        break;

      default:
        ctx.reply(script.error.errorExceptionFunction, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.endRootMenu()
          }
        });
    }
  });

  bot.action(/^approvePayment:(\d+)$/, async (ctx) => {
    const id = Number.parseInt(ctx.match[1]);

    try {
      // set up payment status "paid"
      await db.set(id)('paymentStatus')('paid');

      await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineApprovePayment(id, 'paid')).reply_markup);
    } catch (e) {
      console.log(e);
    }

    return ctx.answerCbQuery(`Встановлений статус "ОПЛАЧЕНО" для користувача: ${id}`);
  });

  bot.action(/^rejectPayment:(\d+)$/, async (ctx) => {
    const id = Number.parseInt(ctx.match[1]);

    try {
      // set up payment status "no paid"
      await db.set(id)('paymentStatus')('nopaid');
      
      await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineApprovePayment(id, 'nopaid')).reply_markup);

    } catch (e) {
      console.log(e);
    }

    return ctx.answerCbQuery(`Встановлений статус "НЕ ОПЛАЧЕНО" для користувача: ${id}`);

  });

  bot.action(/^resetPaymentStatus:(\d+)$/, async (ctx) => {
    const id = Number.parseInt(ctx.match[1]);

    try {
      // set up payment status "unknown"
      await db.set(id)('paymentStatus')('unknown');

      await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineApprovePayment(id, 'unknown')).reply_markup);

    } catch (e) {
      console.log(e);
    }

    return ctx.answerCbQuery(`Встановлений статус "НЕ ВИЗНАЧЕНИЙ" для користувача: ${id}`);
  });

  bot.action(/^paidCheck:(\d+)$/, (ctx) => {
    const id = Number.parseInt(ctx.match[1]);
    return ctx.answerCbQuery(`Статус користувача ${id} - Стан: ОПЛАЧЕНО`);
  });

  bot.action(/^nopaidCheck:(\d+)$/, (ctx) => {
    const id = Number.parseInt(ctx.match[1]);
    return ctx.answerCbQuery(`Статус користувача ${id} - Стан: НЕ ОПЛАЧЕНО`);
  });

  bot.launch();
}

main();

// update