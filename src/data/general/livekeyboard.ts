import { Markup } from "telegraf";
type HideableIKBtn = ReturnType<typeof Markup.button.callback>;

export const liveKeyboard = (id: number, processStatus: string, oid: string): HideableIKBtn[][] => {
    switch(processStatus){
        case "waiting":
            return [
                [
                    Markup.button.callback("✔ Прийняти", `approvePayment:${id},${oid}`)
                ]
            ];
            
        case "accepted":
            return [
                [
                    Markup.button.callback("🟢 В процесі", `approvePayment:${id}`)
                ]
            ];

        case "busy":
            return [
                [
                    Markup.button.callback("🔴 Прийнято іншим оператором", `nopaidCheck:${id}`)
                ]
            ];

        case "declined":
            return [
                [
                    Markup.button.callback("❌ Канал закритий", `nopaidCheck:${id}`)
                ]
            ];

        default:
            return [
                [
                    Markup.button.callback("??_Помилка_створення_кнопки??", ``)
                ]
            ];
    }
};