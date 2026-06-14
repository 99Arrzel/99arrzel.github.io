// Topics for the Vault. To add or rename a topic, edit this object — the index
// page, entry badges, and the content schema all derive from it. The keys are
// the `topic` values you put in each entry's frontmatter.

export interface VaultTopic {
	name: string;
	blurb: string;
	icon: string;
}

export const VAULT_TOPICS = {
	engineering: {
		name: 'Engineering',
		blurb: 'Software architecture, how-tos, and how things actually get built.',
		icon: '🛠️',
	},
	building: {
		name: 'Building',
		blurb: 'SaaS, startups, products, and ideas for making companies.',
		icon: '🚀',
	},
	takes: {
		name: 'Takes',
		blurb: 'Opinions and hot takes on tools, code, and the industry.',
		icon: '🔥',
	},
	life: {
		name: 'Life',
		blurb: 'Personal experiences with software, existential detours, notes to future me.',
		icon: '🌑',
	},
	learning: {
		name: 'Learning',
		blurb: 'Studying in public — math, and the things I want to fill in.',
		icon: '📐',
	},
} as const satisfies Record<string, VaultTopic>;

export type VaultTopicId = keyof typeof VAULT_TOPICS;

// Display order on the index page.
export const VAULT_TOPIC_ORDER = [
	'engineering',
	'building',
	'takes',
	'life',
	'learning',
] as const satisfies readonly VaultTopicId[];

export const VAULT_TOPIC_IDS = Object.keys(VAULT_TOPICS) as [VaultTopicId, ...VaultTopicId[]];
