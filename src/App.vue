<template>
	<div id="app">
		<div class="header">
			<h1 class="title">Hello, Worlds</h1>
			<h2 class="subtitle">A tiny spatial spirograph toy</h2>
		</div>
		<div class="content">
			<p>content goes here</p>
		</div>
	</div>
</template>

<script lang="ts">
	export default {
		name: "App",
		components: {},
		data() {
			return {}
		},
		methods: {},
	}
</script>

<style scoped>
	#app {
		display: flex;
		flex-direction: column;
	}

	p {
		margin: 0;
	}

	.header {
		display: flex;
		flex-direction: column;
		margin-bottom: 15px;
	}

	.title {
		font-size: 22px;
		font-weight: bold;
	}
</style>
