<script lang="ts">
	import ArticleSummaries from '$lib/components/ArticleSummaries.svelte';
	import Head from '$lib/components/Head.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Section from '$lib/components/Section.svelte';
	import { ArticleSize } from '../lib/articles';

	import type { PageData } from './$types';

	export let data: PageData;

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<Head title={['Frontpage', today]} />

<h1 class="headline-xxl">
	Generated by AI,<wbr /> curated by humans
</h1>

{#if data.articles.length === 0}
	<Section isVerticallyCentered={true}>
		<Notice>Sorry, we can't show you the articles right now. Please try again later</Notice>
	</Section>
{:else}
	<Section title="Frontpage" subtitle={today}>
		<ArticleSummaries articles={data.articles.slice(0,7)} singleSize={ArticleSize.MEDIUM} />
	</Section>

	{#if data.articles.slice(8).length > 0}
		<Section title="Throwback news">
			<ArticleSummaries articles={data.articles.slice(8)} singleSize={ArticleSize.SMALL} />
		</Section>
	{/if}
{/if}

<style lang="scss">
	h1.headline-xxl {
		@include container-outer;
		@include headline-xxl;
		text-align: center;
		padding-block: 64px;
		box-sizing: border-box;
		color: var(--color-neutral-100);

		@media (max-width: 768px) {
			font-size: 32px;
			padding-inline: 48px;
		}

		@media (max-width: 640px) {
			font-size: 32px;
			padding-inline: 24px;
		}
	}


</style>
