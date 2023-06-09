// These helpers are meant to mock server responses when during Playwright tests.
// HACK: need to add `.js` extension so it can be imported from tests files.
import { ArticleCategory, type ArticleCompletion } from './articles.js';
import type { CompletionResponse, CompletionUserPrompt } from './openai.js';
import { UNKNOWN_ERROR_MESSAGE } from './utils.js';

export enum MockPrompt {
	GENERATE_ARTICLE_0 = 'GENERATE_ARTICLE_0',
	GENERATE_ARTICLE_1 = 'GENERATE_ARTICLE_1',
	GENERATE_ARTICLE_2 = 'GENERATE_ARTICLE_2',
	GENERATE_ARTICLE_3 = 'GENERATE_ARTICLE_3',
	WRONG_FORMAT = 'WRONG_FORMAT',
	TOO_SHORT = 'TOO_SHORT', // Prompt too short
	THROW_ERROR_429 = 'THROW_ERROR_429', // Rate limit
	THROW_ERROR_500 = 'THROW_ERROR_500' // Server error
}

// Extend `ArticleCompletion` to make the `notes` property required for the mock data
export interface MockArticleCompletion extends ArticleCompletion {
	notes: string;
}

// convert the values of MockPrompt to a const suggestions: string[]
export const suggestions: string[] = Object.values(MockPrompt);

export const MOCK_ARTICLE_COMPLETIONS: MockArticleCompletion[] = [
	{
		headline: 'The Ultimate Guide to Buying a Radioactive Mutant Ficus',
		category: ArticleCategory.SCIENCE,
		body: [
			"For those looking to add a unique touch to their home decor, a radioactive mutant ficus can be an intriguing option. However, it's important to consider a few key factors before making a purchase.",
			"First and foremost, it's crucial to ensure that the vendor you're buying from is reputable and licensed to sell radioactive plants. Don't be afraid to ask for proof of certification.",
			"Additionally, be aware that a radioactive plant comes with certain risks. Make sure you understand how to handle and care for the plant properly to minimize the dangers. It's also a good idea to keep the plant away from children and pets.",
			'Lastly, be prepared to pay a premium price for a true radioactive mutant ficus. These plants are rare and in high demand, so expect to invest a significant amount of money.'
		],
		suggestions,
		notes: 'What a good looking article! If I do say so myself.'
	},
	{
		headline: "J.C. Penny's 50% Off Sale: The Cure for the Great Plague?",
		category: ArticleCategory.OPINION,
		body: [
			'As the world grapples with the deadly Great Plague, J.C. Penny has come to the rescue with a 50% off sale. Yes, you read that right. While experts are frantically searching for a cure, J.C. Penny is offering half-price deals on clothing, accessories and more.',
			"The timing couldn't have been better. Just when people thought all hope was lost, J.C. Penny stepped in with their incredible discounts. Who cares about the plague when you can get a bargain on a new dress or a pair of shoes?",
			"Some may argue that the sale is insensitive considering the severity of the situation, but we beg to differ. J.C. Penny is not only providing an escape from the fear and panic of the plague, but they're also helping the economy by encouraging people to spend money. It's a win-win situation."
		],
		suggestions,
		notes: 'This article was so much fun to write.'
	},
	{
		headline: 'Phonebooks Make a Comeback: The Surprising Resurgence of Printed Directories',
		category: ArticleCategory.BUSINESS,
		body: [
			"In a world where everything is digitized and accessible through a smartphone, it's hard to believe that phonebooks are making a comeback. But that's exactly what's happening in some parts of the country.",
			'According to industry experts, the resurgence of printed directories can be attributed to several factors, including a growing nostalgia for physical media, the desire to unplug from technology, and the need for a reliable backup in case of power outages or internet failures.',
			"While phonebooks may seem like a thing of the past, they are still a valuable resource for many people. In fact, some businesses have reported an increase in calls and inquiries since listing their contact information in printed directories. It seems that for some, the convenience and tangibility of a phonebook simply can't be beat."
		],
		suggestions,
		notes: "It's funny because it's true."
	},
	{
		headline: 'Scientists discover new species of deep sea creatures',
		category: ArticleCategory.SCIENCE,
		body: [
			"Scientists have recently discovered a new species of deep sea creatures that inhabit the abyssal zone, nearly 4,000 meters beneath the ocean's surface.",
			"The new species has been named 'Abyssal Glow' due to its bioluminescent properties and distinctive glowing appearance.",
			'Researchers believe that this discovery could shed new light on the evolution and adaptation of life in extreme environments.'
		],
		suggestions,
		notes: "Not enough RGB on it's bioluminecense."
	}
];

const MOCK_INVALID_ARTICLE_COMPLETION = {
	invalidHeadline: '',
	invalidCategory: '',
	invalidBody: [],
	invalidSuggestions: [],
	invalidNotes: ''
};

export function getCompletionFromMock(
	completionUserPrompt: CompletionUserPrompt
): CompletionResponse {
	// Get the prompt from the last message in the array
	const mockPrompt =
		completionUserPrompt.messages[completionUserPrompt.messages.length - 1]?.content;

	switch (mockPrompt) {
		case MockPrompt.THROW_ERROR_429:
			return { completion: null, status: 429, message: 'Too many requests' };
		case MockPrompt.THROW_ERROR_500:
			return { completion: null, status: 500, message: UNKNOWN_ERROR_MESSAGE };
		case MockPrompt.WRONG_FORMAT:
			return {
				completion: JSON.stringify(MOCK_INVALID_ARTICLE_COMPLETION),
				status: 400,
				message: ''
			};
		case MockPrompt.GENERATE_ARTICLE_1:
			return {
				completion: JSON.stringify(MOCK_ARTICLE_COMPLETIONS[1]),
				status: 200,
				message: ''
			};
		case MockPrompt.GENERATE_ARTICLE_2:
			return {
				completion: JSON.stringify(MOCK_ARTICLE_COMPLETIONS[2]),
				status: 200,
				message: ''
			};
		case MockPrompt.GENERATE_ARTICLE_3:
			return {
				completion: JSON.stringify(MOCK_ARTICLE_COMPLETIONS[3]),
				status: 200,
				message: ''
			};
		default:
			return {
				completion: JSON.stringify(MOCK_ARTICLE_COMPLETIONS[0]),
				status: 200,
				message: ''
			};
	}
}
