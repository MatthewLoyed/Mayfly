/**
 * Inspirational quotes for the Mayfly app.
 */
export const MAYFLY_QUOTES = [
    {
        text: "You can't do everything. But you can do what matters.",
        author: "Mayfly Philosophy"
    },
    {
        text: "Focus on 3 things today, not 30.",
        author: "Mayfly Philosophy"
    },
    {
        text: "Eat the big frog first. The rest will feel easy.",
        author: "Mark Twain (adapted)"
    },
    {
        text: "80% of your results come from 20% of your efforts.",
        author: "Pareto Principle"
    },
    {
        text: "Consistency is better than intensity.",
        author: "Mayfly Philosophy"
    },
    {
        text: "Your garden grows when you show up, not when you rush.",
        author: "Mayfly Philosophy"
    },
    {
        text: "A mayfly lives for a day. Make yours count.",
        author: "Mayfly Philosophy"
    },
    {
        text: "Saying 'no' to the good allows you to say 'yes' to the great.",
        author: "Jim Collins (adapted)"
    },
    {
        text: "Deep work is the superpower of the 21st century.",
        author: "Cal Newport (adapted)"
    },
    {
        text: "The secret to getting ahead is getting started.",
        author: "Mark Twain"
    }
];

export function getRandomQuote() {
    return MAYFLY_QUOTES[Math.floor(Math.random() * MAYFLY_QUOTES.length)];
}
