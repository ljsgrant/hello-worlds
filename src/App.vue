<template>
	<div id="app">
		<div class="header">
			<div class="logo">🪐</div>
			<div class="title-wrapper">
				<h1 class="title">Hello, Worlds <span>🚀</span></h1>
				<h2 class="subtitle">A tiny planetary spirograph toy</h2>
			</div>
			<p class="disclaimer">
				No physics were harmed in the making of this software
			</p>
		</div>
		<div class="content">
			<ThreeScene :star="star" :planets="planets" />
		</div>
		<div class="controls">
			<BodyToFollow :planets="planets" />
		</div>
	</div>
</template>

<script lang="ts">
	import ThreeScene from "./components/ThreeScene.vue"
	import BodyToFollow from "./components/BodyToFollow.vue"
	export default {
		name: "App",
		components: { ThreeScene, BodyToFollow },
		data() {
			return {}
		},
		methods: {},
	}
</script>

<style lang="scss" scoped>
	#app {
		display: flex;
		flex-direction: column;
	}

	p {
		margin: 0;
	}

	.header {
		display: flex;
		flex-direction: row;
		margin-bottom: 12px;
		color: white;
		align-items: center;
		padding: 0 32px 0 8px;
	}

	.title {
		font-size: 22px;
		font-weight: bold;

		span {
			margin-left: 4px;
		}
	}

	.logo {
		font-size: 42px;
		margin-right: 11px;
	}

	.disclaimer {
		font-size: 10px;
		margin-left: 12px;
		font-style: italic;
		margin-top: auto;
		margin-left: auto;
	}
</style>
