<script>
	export let color = "red";
	export let glow = false;
	export let disabled = false;
</script>

<div class="button {color}" class:glow>
    <slot>-</slot>
</div>