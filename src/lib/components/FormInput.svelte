<script lang="ts">
	export let name: string;
	// type could be any possible input types: number, text, email, etc.
	export let type: 'text' | 'number' | 'email' | 'password' = 'text';
	export let value: string | number | null = null;
	export let placeholder: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;

	const setType = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<input
	{name}
	{placeholder}
	{required}
	{disabled}
	minlength={type === 'password' ? 8 : undefined}
	maxlength={type === 'password' ? 72 : undefined}
	use:setType
	bind:value
	class="form-field-input"
/>

<style lang="scss">
	input.form-field-input {
		@include baseInput;

		line-height: 1em;

		&:disabled {
			@include disabledInput;
		}
	}
</style>
