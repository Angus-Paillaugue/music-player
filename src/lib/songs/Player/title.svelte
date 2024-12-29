<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<h3 class="line-clamp-1 w-full text-start text-lg font-medium text-forground">{title}</h3>
