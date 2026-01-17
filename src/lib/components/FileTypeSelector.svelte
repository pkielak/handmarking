<script lang="ts">
	import { List, ListInput } from 'konsta/svelte';

	interface FileTypeSelectorProps {
		fileType: 'md' | 'txt';
		onFileTypeChange: (fileType: 'md' | 'txt') => void;
	}

	let { fileType, onFileTypeChange }: FileTypeSelectorProps = $props();
</script>

<List class="my-0 px-2">
	<p class="my-0 mb-2">How and where do you want to save your texts?</p>
	<ListInput
			class="-mx-4 mb-2 py-0"
			inputClass="mx-0"
			label="File Type"
			type="select"
			dropdown
			value={fileType}
			placeholder="Select file type"
			onchange={(e) => {
				const newFileType = (e.target as HTMLInputElement).value as 'md' | 'txt';
				onFileTypeChange(newFileType);
			}}
		>
			<option value="md">md</option>
			<option value="txt">txt</option>
		</ListInput>
</List>
