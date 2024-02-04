// PrivateBank Bot Practive University Work
// Developed by Yaroslav Volkivskyi (TheLaidSon)

// Actual v0.0.4

// Main File

// import { inlineApprovePayment } from "./data/paymentKeyboards";
import exchangeRateS from "./base/functions/exchangeRate";
import * as schedule from 'node-schedule';
import Timer from "./data/generator/scheduleTimer";
import { botVersion, about } from "./base/sysinfo";
import { formattedName, processPhoneNumber } from "./data/general/formatTextData";
import { CheckException } from "./base/check";
import ExchangeRate, { Values, getFlagByCode } from "./data/exchange_rates/valuesData";
import { convertRateExchange, convertToNameRateExchange } from "./data/exchange_rates/convertRateExchange";
import keyboards from "./data/general/keyboards";
import arch from "./base/architecture";
import DateRecord, { DateHistory } from "./data/date";
import script from "./data/general/script";
import { liveKeyboard } from "./data/general/livekeyboard";
import GenerateNewTransactionHistory from "./data/generator/generateNewTransactionHistory";
import { CheckQARegular, q_a, q_aAnswers } from "./base/functions/qa";
import generatePrivatBankCardNumber from "./data/generator/generateCardNumber";
import { Markup } from "telegraf";
import { ObjectId } from "mongodb";

async function main() {
  const [ onTextMessage, onContactMessage, , bot, db, dbRequest ] = await arch();

  //Begin bot work, collecting user data (his telegram name)
  bot.start((ctx) => {
    const set = db.set(ctx?.chat?.id ?? -1);
    console.log('\n\nBOT STARTED');
    ctx.reply(script.entire.greeting, {reply_markup: { remove_keyboard: true }});

    const username = ctx.chat.type === "private" ? ctx.chat.username ?? null : null;
    set('username')(username ?? 'unknown');
    handleStart(ctx?.chat?.id, Timer());
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

  const handleStart = (chatId: number, timer: string) => {
    const job = schedule.scheduleJob(timer, async () => {
      const transaction = GenerateNewTransactionHistory();
      await dbRequest.WriteNewTransactionHistory(chatId, {historyAuthor: transaction.author, historyDate: DateHistory(), historyTypeOfTransfer: transaction.typeOfTransfer, historyText: transaction.text})
      
      job.reschedule(Timer());
    });
  };

  bot.command('menu', async (ctx) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    ctx.reply(script.entire.functionEntire, {
      parse_mode: "Markdown",
      reply_markup: {
        one_time_keyboard: true,
        keyboard: keyboards.menu(),
      },
    });
    await set('state')('FunctionRoot');
  })

  bot.command('settings', async (ctx) => {
    const set = db.set(ctx?.chat?.id ?? -1);

    ctx.reply(script.settings.open, {
      reply_markup: {
        one_time_keyboard: true,
        keyboard: keyboards.settingsMenu()
      }
    })

    await set('state')('SettingsHandler');
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
      const cardNumber = generatePrivatBankCardNumber();
      set('phone_number')(processPhoneNumber(data.phone_number));

      if (!(await dbRequest.GetUserData(ctx?.chat?.id ?? -1))){
        await dbRequest.AddData({ id: ctx?.chat?.id ?? -1, name: user['name'], 
          date: DateRecord(), card: cardNumber, phone: data.phone_number, balance: 700});
      }
  
      await ctx.reply(script.entire.thanksForComplet(cardNumber))
  
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

        if (currentUser?.historyAuthor){
          const [ author, date, typeOfTransfer, text ] = await dbRequest.GetUserTransactionsHistory(ctx?.chat?.id ?? -1);

          let startPosition = author.length > 5 ? author.length - 5 : 0;

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
        const objectList = await dbRequest.CreateNewLiveSupport(),
          status = await db.get(ctx?.chat?.id ?? -1)('processStatus') ?? "waiting",
          usersCollection = await dbRequest.GetAllUsers(),
          inline = liveKeyboard(ctx?.chat?.id ?? -1, status, objectList.insertedId.toString());
        let allBusy = true,
          arrayIDs = [], arrayCIDs = [];

        for (let n = 0; n < usersCollection.length; n++){
          if (usersCollection[n].system_role === 'worker' && usersCollection[n].available === 'available'){
            const message = ctx.telegram.sendMessage(usersCollection[n].id, script.liveSupport.userRequest(user['name'], user['username'], user['phone_number'], DateHistory()), {
              parse_mode: "HTML",
              ...Markup.inlineKeyboard(inline)
            }); 
            arrayIDs.push((await message).message_id);
            arrayCIDs.push(usersCollection[n].id);
            allBusy = false;
          }
        }

        if (allBusy){
          ctx.reply("Вибачте, але наразі всі оператори заняті, спробуйте, будь ласка, пізніше. Вибачте за незручності", {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: keyboards.menu()
            }
          });
        }
        else{
          await dbRequest.AddMessageIDsLiveSupport(objectList.insertedId, arrayIDs, arrayCIDs);
          await ctx.reply(script.liveSupport.userRespond);
        }
        break;

      case "Поширені питання":
        ctx.reply(script.qA.chooseQuestion, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: q_a
          }
        })
        await set('state')('Q&AHandler');
        break;

      case "Налаштування":
        ctx.reply(script.settings.open, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.settingsMenu()
          }
        })
    
        await set('state')('SettingsHandler');
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
          await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", convertToNameRateExchange(ExchangeRate[i].code)), user['activeValue'] ?? "UAH", i)}\n`
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
      const input = await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", data.text);

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
      const input = await exchangeRateS.getSpecificRates(user['activeValue'] ?? "UAH", data.text);
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

  onTextMessage('Q&AHandler', async(ctx, user, set, data) => {
    if (CheckQARegular(data.text)){
      ctx.reply(q_aAnswers[data.text], {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: q_a
        }
      })
    }
    else if (data.text === 'В МЕНЮ'){
      ctx.reply(script.entire.functionEntire, {
        parse_mode: "Markdown",
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.menu(),
        },
      });
      await set('state')('FunctionRoot');
    }
    else{
      ctx.reply(script.error.buttonError, {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: q_a
        }
      })
    }
  })

  onTextMessage('SettingsHandler', async(ctx, user, set, data) => {
    switch(data.text){
      case "Основна валюта":
        ctx.reply(script.settings.values, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.countryRateMenu()
          }
        })

        await set('state')('ChangingMainRateAndReturn');
        break;

      case "В МЕНЮ":
        await ctx.reply(script.entire.functionEntire, {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.menu(),
          },
        });

        await set('state')('FunctionRoot');
        break;

      default:
        ctx.reply(script.error.buttonError, {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: keyboards.settingsMenu()
          }
        })
        break;
    }
  })

  onTextMessage('ChangingMainRateAndReturn', async(ctx, user, set, data) => {
    if (CheckException.TextException(data)){
      if (await exchangeRateS.getSpecificRates(convertRateExchange[data.text], data.text)){
        await set('activeValue')(convertRateExchange[data.text]);
        ctx.reply(script.settings.changed(data.text), {
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

  onTextMessage('UserLiveSupportHandler', async(ctx, user, set, data) => {
    if (data.text === 'ВІДМІНА'){
      const [ messages, chats ] = await dbRequest.GetMessageIDsLiveSupport(new ObjectId(user['userObjectCloseLiveSupport']));

      for(let n = 0; n < messages.length; n++){
        await ctx.telegram.editMessageReplyMarkup(chats[n], messages[n], undefined, Markup.inlineKeyboard(liveKeyboard(ctx?.chat?.id ?? -1, 'declined', user['userObjectCloseLiveSupport'])).reply_markup)
      }

      ctx.reply('Канал успішно закрито, сподіваємося ваше питання було вирішено!', {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.endRootMenu()
        }
      });

      ctx.telegram.sendMessage(user['activeHelperLiveSupport'], "Користувач закрив канал.", {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.endRootMenu()
        }
      })

      await dbRequest.ChangeAvaibiltyForOperator(parseInt(user['activeHelperLiveSupport']), true);

      await db.set(parseInt(user['activeHelperLiveSupport']))('state')('EndFunctionManager');
      await set('state')('EndFunctionManager');
    }
    else{
      ctx.telegram.sendMessage(user['activeHelperLiveSupport'], data.text, {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.liveSupportProbablyCancel()
        }
      })
    }
  })

  onTextMessage('OperatorLiveSupportHandler', async(ctx, user, set, data) => {
    if (data.text === 'ВІДМІНА'){
      const [ messages, chats ] = await dbRequest.GetMessageIDsLiveSupport(new ObjectId(user['operatorObjectCloseLiveSupport']));

      for(let n = 0; n < messages.length; n++){
        await ctx.telegram.editMessageReplyMarkup(chats[n], messages[n], undefined, Markup.inlineKeyboard(liveKeyboard(ctx?.chat?.id ?? -1, 'declined', user['operatorObjectCloseLiveSupport'])).reply_markup)
      }

      ctx.reply('Прекрасно, тепер можете відпочивати', {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.endRootMenu()
        }
      })

      ctx.telegram.sendMessage(user['activeUserLiveSupport'], "Оператор закрив канал, сподіваємося ваше питання було вирішено.", {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.endRootMenu()
        }
      })

      await dbRequest.ChangeAvaibiltyForOperator(ctx?.chat?.id ?? -1, true);

      await db.set(parseInt(user['activeUserLiveSupport']))('state')('EndFunctionManager')
      await set('state')('EndFunctionManager');
    }
    else{
      switch (true){
        case CheckException.TextException(data):
          ctx.telegram.sendMessage(user['activeUserLiveSupport'], data.text, {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: keyboards.liveSupportProbablyCancel()
            }
          })
          break;

        case CheckException.FileException(data):
          ctx.telegram.sendDocument(user['activeUserLiveSupport'], data.file, {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: keyboards.liveSupportProbablyCancel()
            }
          })
          break;

        case CheckException.LocationException(data):
          ctx.telegram.sendLocation(user['activeUserLiveSupport'], data.location[0], data.location[1], {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: keyboards.liveSupportProbablyCancel()
            }
          })
          break;

        case CheckException.PhoneException(data):
          ctx.telegram.sendContact(user['activeUserLiveSupport'], data.location[0], data.location[1], {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: keyboards.liveSupportProbablyCancel()
            }
          })
          break;
      }
    }
  })

  bot.action(/^acceptSupport:(\d+),(.+)$/, async (ctx) => {
    const id = Number.parseInt(ctx.match[1]),
      object = ctx.match[2],
      [ messages, chats ] = await dbRequest.GetMessageIDsLiveSupport(new ObjectId(object));
    let operator: string | undefined = '';

    try {
      for(let n = 0; n < messages.length; n++){
        if (messages[n] === ctx.callbackQuery.message?.message_id){
          await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(liveKeyboard(id, 'accepted', ctx.match[2])).reply_markup);
          operator = await db.get(chats[n])('name');
          await db.set(id)('activeHelperLiveSupport')(chats[n]);
          await db.set(id)('userObjectCloseLiveSupport')(object);
          await db.set(chats[n])('operatorObjectCloseLiveSupport')(object);
          await db.set(chats[n])('activeUserLiveSupport')(id.toString());
          await db.set(chats[n])('state')('OperatorLiveSupportHandler');
          await db.set(id)('state')('UserLiveSupportHandler');
          await dbRequest.ChangeAvaibiltyForOperator(chats[n], false);
        }
        else await ctx.telegram.editMessageReplyMarkup(chats[n], messages[n], undefined, Markup.inlineKeyboard(liveKeyboard(id, 'busy', ctx.match[2])).reply_markup)
      }
      ctx.telegram.sendMessage(id, `Ваш запит прийняв оператор ${operator}`, {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.liveSupportProbablyCancel()
        }
      });
      ctx.reply('Ви успішно прийняли запит користувача, можете працювати', {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: keyboards.liveSupportProbablyCancel()
        }
      })
    } catch (e) {
      console.log(e);
    }

    return ctx.answerCbQuery(`Ви успішно взяли замовлення`);
  });

  // bot.action(/^rejectPayment:(\d+)$/, async (ctx) => {
  //   const id = Number.parseInt(ctx.match[1]);

  //   try {
  //     // set up payment status "no paid"
  //     await db.set(id)('paymentStatus')('nopaid');
      
  //     await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineApprovePayment(id, 'nopaid')).reply_markup);

  //   } catch (e) {
  //     console.log(e);
  //   }

  //   return ctx.answerCbQuery(`Встановлений статус "НЕ ОПЛАЧЕНО" для користувача: ${id}`);

  // });

  // bot.action(/^resetPaymentStatus:(\d+)$/, async (ctx) => {
  //   const id = Number.parseInt(ctx.match[1]);

  //   try {
  //     // set up payment status "unknown"
  //     await db.set(id)('paymentStatus')('unknown');

  //     await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineApprovePayment(id, 'unknown')).reply_markup);

  //   } catch (e) {
  //     console.log(e);
  //   }

  //   return ctx.answerCbQuery(`Встановлений статус "НЕ ВИЗНАЧЕНИЙ" для користувача: ${id}`);
  // });

  // bot.action(/^paidCheck:(\d+)$/, (ctx) => {
  //   const id = Number.parseInt(ctx.match[1]);
  //   return ctx.answerCbQuery(`Статус користувача ${id} - Стан: ОПЛАЧЕНО`);
  // });

  // bot.action(/^nopaidCheck:(\d+)$/, (ctx) => {
  //   const id = Number.parseInt(ctx.match[1]);
  //   return ctx.answerCbQuery(`Статус користувача ${id} - Стан: НЕ ОПЛАЧЕНО`);
  // });

  bot.launch();
}

main();