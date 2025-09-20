<template>
	<div>
		<h1>Body to Follow</h1>
		<select
			name="planets"
			id="planets"
			v-model="bodyToFollow"
			@change="handleBodyToFollowChange"
		>
			<option value="volvo" v-for="planet in planets" :key="planet.name">
				{{ planet.name }}
			</option>
		</select>
	</div>
</template>

<script lang="ts">
	export default {
		name: "BodyToFollow",
		props: {
			planets: {
				type: Array as PropType<Planet[]>,
				required: true,
			},
		},
		data() {
			return {
				bodyToFollow: "",
			}
		},
		methods: {
			handleBodyToFollowChange(event: Event) {
				this.$emit("body-to-follow", this.bodyToFollow)
			},
		},
	}
</script>
