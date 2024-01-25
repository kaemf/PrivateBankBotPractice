// PrivateBank Bot Practive University Work
// Developed by Yaroslav Volkivskyi (TheLaidSon)

// Actual v0.0.3

// Main File

import { inlineApprovePayment } from "./data/paymentKeyboards";
import exchangeRateS from "./base/functions/exchangeRate";
import * as schedule from 'node-schedule';
import Timer from "./data/scheduleTimer";
import { botVersion, about } from "./base/sysinfo";
import { formattedName, processPhoneNumber } from "./data/general/formatTextData";
import { CheckException } from "./base/check";
import ExchangeRate, { Values, getFlagByCode } from "./data/valuesData";
import { convertRateExchange, convertToNameRateExchange } from "./data/convertRateExchange";
import keyboards from "./data/keyboards";
import arch from "./base/architecture";
import DateRecord from "./data/date";
import script from "./data/script";
import { Markup } from "telegraf";

async function main() {
  const [ onTextMessage, onContactMessage, , bot, db, dbRequest ] = await arch();
  let timer = Timer();

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

  const job = schedule.scheduleJob(timer, async () => {
    await dbRequest.WriteNewTransactionHistory(ctx?.chat?.id ?? -1, {})
    
    // Обновление таймера
    timer = Timer();
    
    job.reschedule(timer);
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
  onTextMessage('WaitingForName', async (ctx, user, set, data) => {
    if (CheckException.TextException(data)){
      const name = formattedName(data.text);
      
      console.log(`Name: ${name}`);
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
  onContactMessage('AskingForPhoneNumber', async (ctx, user, set, data) => {
    if (CheckException.PhoneException(data)){
      set('phone_number')(processPhoneNumber(data.phone_number));
  
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

  onTextMessage('FunctionRoot', async(ctx, user, set, data) => {
    await set('recording-date')(DateRecord());

    switch(data.text){
      case "Баланс та історія транзакцій":
        const currentUser = await dbRequest.GetUserData(ctx?.chat?.id ?? -1);
        //  await dbRequest.WriteNewTransactionHistory(ctx?.chat?.id ?? -1, {historyAuthor: "Brain", historyDate: DateRecord(), 
        //  historyTypeOfTransfer: "incoming", historyText: "500"});

        if (currentUser?.historyAuthor){
          const [ author, date, typeOfTransfer, text ] = await dbRequest.GetUserTransactionsHistory(ctx?.chat?.id ?? -1);

          let startPosition = 0;

          if (author.length > 10) startPosition = author.length - 10;

          for (startPosition; startPosition < author.length; startPosition++){
            await ctx.reply(script.balanceAndHistory.showData(author[startPosition], date[startPosition], typeOfTransfer[startPosition], text[startPosition]),
            {parse_mode: "HTML"});
          }
        }
        else await ctx.reply(script.balanceAndHistory.showErrorToShowData);

        await ctx.reply(script.balanceAndHistory.showActualCardBalance(currentUser?.balance === undefined ? 0 : currentUser.balance), {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });
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

  onTextMessage('ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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

      case "Курс конкретної валюти":
        ctx.reply(script.values.chooseSpecificExchangeRate, {
          reply_markup: {
            one_time_keyboard: true, 
            keyboard: keyboards.countryRateMenu()
          }
        })

        await set('state')('RespondExchangeAndReturn')
        break;

      case "Конвертація в валюту":
        ctx.reply(script.values.requestNumberToConvert);
        await set('state')('RespondNumberAndRequestCountry');
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

  onTextMessage('_ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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

  onTextMessage('__ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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

  onTextMessage('___ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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

  onTextMessage('____ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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

  onTextMessage('_____ValuesMenuHandlerAndRoot', async(ctx, user, set, data) => {
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
        await ctx.reply(script.error.buttonError, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.valueExchangeEndMenu(),
          },
        });
        break;
      
    }
  })

  onTextMessage('RespondExchangeAndReturn', async(ctx, user, set, data) => {
    if (CheckException.TextException(data)){
      const input = await exchangeRateS.getSpecificRates("UAH", data.text);

      if (input){
        ctx.reply(script.values.valueData(`${getFlagByCode(convertRateExchange[data.text]) ? getFlagByCode(convertRateExchange[data.text]) : "🏳"} ${data.text}`, 
        input, convertRateExchange[data.text], 0), {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true, 
            keyboard: keyboards.endRootMenu()
          }
        })

        await set('state')('EndFunctionManager');
      }
      else{
        await ctx.reply(script.error.buttonError, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.countryRateMenu(),
          },
        });
      }
    }
    else{
      await ctx.reply(script.error.buttonError, {
        parse_mode: "Markdown",
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.countryRateMenu(),
        },
      });
    }
  })

  

  onTextMessage('EndFunctionManager', async(ctx, user, set, data) => {
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

  onTextMessage('RespondNumberAndRequestCountry', async(ctx, user, set, data) => {
    if (CheckException.TextException(data) && !isNaN(parseInt(data.text)) && parseInt(data.text) >= 0){
      await set('valueInputedForConvert')(data.text);

      ctx.reply(script.values.chooseSpecificExchangeRate, {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.countryRateMenu()
        }
      })

      await set('state')('RespondCoutryAndProcess');
    }
    else{
      ctx.reply('Вам потрібно ввести цифру більше 0');
    }
  })

  onTextMessage('RespondCoutryAndProcess', async(ctx, user, set, data) => {
    if (CheckException.TextException(data)){
      const input = await exchangeRateS.getSpecificRates("UAH", data.text);
      if (input){
        ctx.reply(script.values.customValueData(`${getFlagByCode(convertRateExchange[data.text])} ${data.text}`, user['valueInputedForConvert'], 
        parseInt(user['valueInputedForConvert']) * input, convertRateExchange[data.text]), {
          parse_mode: "HTML",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.endRootMenu()
          }
        });

        await set('state')('EndFunctionManager');
      }
      else{
        ctx.reply(script.error.buttonError, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.countryRateMenu()
          }
        })
      }
    }
    else{
      ctx.reply(script.error.buttonError, {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.countryRateMenu()
        }
      })
    }
  })

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