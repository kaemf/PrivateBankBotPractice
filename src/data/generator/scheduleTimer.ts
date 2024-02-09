export default function Timer() {
    const randomIntervalSeconds = Math.floor(Math.random() * (300 - 5) + 5),
        randomIntervalMinutes = Math.ceil(randomIntervalSeconds / 60),
        cronExpression = `*/${randomIntervalMinutes} * * * *`;

    console.log(`\nNext Transaction Generation: ${randomIntervalMinutes} minutes\n`);

    return cronExpression;
}