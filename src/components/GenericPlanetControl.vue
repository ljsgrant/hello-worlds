<template>
	<div class="control-wrapper">
		<p class="control-label">{{ inputConfiguration.label }}</p>
		<div class="input-wrapper">
			<input
				v-if="
					inputConfiguration.type === 'range' ||
					inputConfiguration.type === 'number'
				"
				:type="inputConfiguration.type"
				:min="inputConfiguration.min"
				:max="inputConfiguration.max"
				:step="inputConfiguration.step"
				v-model="currentValue"
				@change="handleChange"
			/>
			<input
				v-else
				:type="inputConfiguration.type"
				v-model="currentValue"
				@change="handleChange"
			/>
			<p>{{ currentValue }}</p>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue"
	import type { PropType } from "vue"
	import type { ControlsConfiguration, Planet } from "../types/types"
	import { numberToHexColor } from "../function/utils"

	export default defineComponent({
		name: "GenericPlanetControl",
		props: {
			inputConfiguration: {
				type: Object as PropType<ControlsConfiguration>,
				required: true,
			},
			planet: {
				type: Object as PropType<Planet>,
				required: true,
			},
		},
		data() {
			return {
				currentValue: this.inputConfiguration.default,
			}
		},
		mounted() {
			if (this.planet && this.inputConfiguration.property in this.planet) {
				let value: any =
					this.planet?.[this.inputConfiguration.property as keyof Planet]

				if (this.inputConfiguration.property === "colour") {
					try {
						const parsedValue = numberToHexColor(value)
						value = parsedValue
					} catch (error) {
						console.error(error)
						return
					}
				}

				if (value !== null && value !== undefined) {
					;(this.currentValue as any) = value
				}
			}
		},
		methods: {
			handleChange(event: Event) {
				this.$emit("change", {
					...this.inputConfiguration,
					value: this.currentValue,
				})
			},
		},
	})
</script>

<style lang="scss" scoped>
	.control-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
	}

	.control-label {
		font-size: 12px;
		color: #fff;
	}

	.input-wrapper {
		display: flex;
		flex-direction: row;
	}
</style>
