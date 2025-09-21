<template>
	<div>
		<p class="control-title">Body to Follow</p>
		<select
			name="planets"
			id="planets"
			v-model="bodyToFollow"
			@change="handleBodyToFollowChange"
		>
			<option
				:value="planet.name"
				v-for="planet in [star, ...planets]"
				:key="planet.name"
			>
				{{ planet.name }}
			</option>
		</select>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue"
	import type { PropType } from "vue"
	import type { Star, Planet } from "../types/types"

	export default defineComponent({
		name: "BodyToFollow",
		props: {
			star: {
				type: Object as PropType<Star>,
				required: true,
			},
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
		mounted() {
			this.bodyToFollow = this.star?.name || ""
			this.handleBodyToFollowChange()
		},
		methods: {
			handleBodyToFollowChange() {
				this.$emit("body-to-follow", this.bodyToFollow)
			},
		},
		computed: {},
	})
</script>
