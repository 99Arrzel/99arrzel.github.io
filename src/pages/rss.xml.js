import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

// Everything written on the site, newest first: the Vault is where the writing
// lives now, and the older blog posts stay in the feed they were published to.
export async function GET(context) {
	const item = (base) => (entry) => ({
		title: entry.data.title,
		description: entry.data.description,
		pubDate: entry.data.pubDate,
		link: `/${base}/${entry.id}/`,
	});
	const vault = await getCollection('vault', ({ data }) => !data.draft);
	const blog = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: [...vault.map(item('vault')), ...blog.map(item('blog'))].sort(
			(a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
		),
	});
}
