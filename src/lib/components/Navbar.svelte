<script lang="ts">
	import { Navbar as KonstaNavbar, NavbarBackLink, Link } from 'konsta/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	interface NavbarProps {
		title: string;
		showSettings?: boolean;
		backLink?: string;
		transparent?: boolean;
		absolute?: boolean;
	}

	let {
		title,
		showSettings = true,
		backLink,
		transparent = false,
		absolute = false
	}: NavbarProps = $props();
</script>

<KonstaNavbar {title} class={`z-20 ${absolute ? 'absolute ' : ''}`} {transparent}>
	{#snippet left()}
		{#if backLink}
			<NavbarBackLink text="Back" onClick={() => goto(resolve(backLink as '/'))} />
		{/if}
	{/snippet}

	{#snippet right()}
		{#if showSettings}
			<Link iconOnly onClick={() => goto(resolve('/settings' as '/'))}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-settings-icon lucide-settings"
					><path
						d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
					/><circle cx="12" cy="12" r="3" /></svg
				></Link
			>
		{/if}
	{/snippet}
</KonstaNavbar>
