import { getAllKeys } from "./convertRateExchange"

class Keyboard{
    menu(){
        return [
            [
              {
                text: "Баланс та історія транзакцій",
              },
              {
                text: "Валюти",
              },
            ],
            [
              {
                text: 'Лайв підтримка'
              },
              {
                text: "Поширені питання"
              }
            ]
        ]
    }

    sharePhone(){
        return [
            [
              {
                text: "Поділитися телефоном",
                request_contact: true,
              },
            ],
        ]
    }

    yesOrNo(){
        return [
            [
              {
                text: "Так",
              },
              {
                text: "Ні",
              },
            ],
        ]
    }

    endRootMenu(){
        return [
            [
              {
                text: 'В МЕНЮ'
              },
              {
                text: '❔ Про Бота'
              }
            ]
        ]
    }

    valuesMenu(){
      return [
        [
          {
            text: "Курси валют"
          },
          {
            text: "Курс конкретної валюти"
          }
        ],
        [
          {
            text: "Конвертація в валюту"
          }
        ]
      ]
    }

    valueExchangeEndMenu(end?: boolean){
      return end === true 
      ?
      [
        [
          {
            text: "В МЕНЮ"
          }
        ]
      ]
      :
      [
        [
          {
            text: "В МЕНЮ"
          },
          {
            text: "Більше ->"
          },
        ]
      ]
    }

    countryRateMenu(){
      return getAllKeys().map((el: string) => {
        return [{ text: el }];
      });
    }
}

const keyboards = new Keyboard();
export default keyboards;