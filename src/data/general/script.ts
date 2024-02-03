const script = {

  entire: {
    greeting: `Привіт😊 Вас вітає чат бот банку "ПриватБанк"? Підкажіть, будь ласка, як можна до Вас звертатися?`,
    thanksOnStart: (name : string) => `Дуже приємно, ${name}🤗`,
    phoneRequire: `Тепер, будь ласка, нам потрібен ваш номер телефону, щоб ми могли індетифікувати вас і вашу карту`,
    thanksForComplet: (card : number) => `Дуже вдячні Вам 💙\n\nВаш номер картки - ${card}.`,
    functionEntire: `Тепер, будь ласка, оберіть функцію якою б хотіли скористатися`
  },

  error: {
    errorExceptionFunction: `Ой, халепа... Щось пішло не так...😬\nСпробуйте, будь ласка, скористатися кнопками нижче для вибору функції! ⬇️`,
    buttonError: `От халепа... \n\nБудь ласка, оберіть кнопку нижче ⬇️`,
    classicTextError: `Ого-го... щиро дякуємо, але вам потрібно просто написати, нічого більше :)`,
    paymentError: `Ой.. лишенько.. \n\nВам потрібно завантажити скрін з галереї або надіслати файл (підтримовані формати: pdf, jpeg, jpg, png, heic)`,
    phoneError: `Ой-ой... вам потрібно натиснути внизу на кнопку “Поділитися номером”`
  },

  values: {
    entire: `Чудесно, тепер оберіть конекретніше, що вам саме потрібно`,

    exchangeAllLoad: {
      state0: "Почекайте будь ласка, завантаження курсів валют...",
      state1: "Почекайте будь ласка, завантажуємо ще більше курсів...",
      state2: "Зачекайте, будь ласка, ще трохи, завантажуємо ще більше курсів...",
      state3: "Знову ж таки, зачекайте хвильку, завантажуємо ще більше курсів...",
      state4: "Мить і все буде готово, завантажуємо ще більше курсів...",
      state5: "І останній раз... завантажуємо ще більше курсів..."
    },

    chooseSpecificExchangeRate: `Виберіть, будь ласка, валюту ⤵️`,

    requestNumberToConvert: `Яку суму потрібно конвертувати?`,

    valueData: (name: string, value: string, code: string, number: number) => 
    number < 1 ? `<b>${name}</b> - ${value} ${code.toLocaleLowerCase()}.` : `|\n|\n<b>${name}</b> - ${value} ${code.toLocaleLowerCase()}.`,

    customValueData: (name: string, nonprocessed: string, value: number, code: string) => 
    `<b>${nonprocessed}</b> uah. в <b>${name}</b> становить <b>${value}</b> ${code.toLocaleLowerCase()}.`
  },

  balanceAndHistory: {
    showData: (author: string, date: string, type: string, text: string) => 
    `🛍<b>${author}</b>\n\n💸${type === 'outgoing' ? (text === 'fail' ? '' : '-') : '+'}${text === 'fail' ? "<b>Недостатньо коштів для транзакції</b>" : `<b>${text}</b> uah.`}\n\n\n📅 ${date} 📅`,

    showErrorToShowData: `У вас відсутні транзакції.`,

    showActualCardBalance: (balance: number) => `Баланс вашої картки - ${balance} uah.`
  },

  qA: {
    chooseQuestion: `Чудово! Яке питання вас цікавить?`
  },

  settings: {
    open: `Меню налаштувань.\n\nВиберіть, будь ласка, знизу кнопочку, параметр, який потрібно змінити`,

    values: `Виберіть валюту, котра буде основною.\n\nЗА ЗАМОВЧУВАННЯМ "Українські гривні (UAH)"`,

    changed: (rate: string) => `Успішно змінено на ${rate}`
  },

  liveSupport: {
    userRequest: (name: string, telegram: string, phone: string, dateRequest: string) => `Новий запит на підтримку!\n\nІм'я - ${name} (@${telegram})\nТелефон - ${phone}\n\nДата заявки - ${dateRequest}`,
    userRespond: `Ваш запит прийнято, очікуйте на оператора`
  }

}

export default script;