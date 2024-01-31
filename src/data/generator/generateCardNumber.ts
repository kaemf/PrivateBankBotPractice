export default function generatePrivatBankCardNumber(): number {
    const prefix = '4149',
        randomBlock = Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        randomBlock2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        randomBlock3 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return parseInt(`${prefix}${randomBlock}${randomBlock2}${randomBlock3}`);
}