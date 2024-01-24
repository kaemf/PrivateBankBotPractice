class Keyboard{
    menu(){
        return [
          // Баланс і історія транзакцій
          // Конвертація валют
          // Підтримка за доп працівника
          // Калькулятор валют (перегляд курса валют)
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
}

const keyboards = new Keyboard();
export default keyboards;