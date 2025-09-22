<template>
	<div class="planet-controls-wrapper">
		<p class="control-title">{{ planet.name }}</p>
		<div v-for="control in validControlsConfiguration" :key="control.property">
			<GenericPlanetControl
				:input-configuration="control"
				:planet="planet"
				@change="
					$emit('change', {
						...$event,
						planetName: planet.name,
					})
				"
			/>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue"
	import type { PropType } from "vue"
	import type { Star, Planet, ControlsConfiguration } from "../types/types"
	import GenericPlanetControl from "./GenericPlanetControl.vue"

	export default defineComponent({
		name: "PlanetControls",
		components: { GenericPlanetControl },
		props: {
			planet: {
				type: Object as PropType<Planet>,
				required: true,
			},
		},
		data() {
			return {
				controlsConfiguration: [
					{ property: "name", label: "name", type: "text", default: "" },
					{
						property: "colour",
						label: "colour",
						type: "color",
						default: "#00e5ff",
					},
					{
						property: "radius",
						label: "radius",
						type: "number",
						default: 1,
						min: 0.5,
						max: 10,
					},
					{
						property: "maxOrbitLength",
						label: "maximum trail length",
						type: "range",
						default: 10000,
						min: 0,
						max: 100000,
					},
					{
						property: "semiMajorAxis",
						label: "semi-major axis",
						type: "range",
						default: 1.2,
						min: 0.01,
						max: 100,
					},
					{
						property: "eccentricity",
						label: "eccentricity",
						type: "range",
						default: 0,
						min: 0,
						max: 0.99,
					},
					{
						property: "inclination",
						label: "inclination",
						type: "range",
						default: 135,
						min: 0,
						max: 180,
					},
					{
						property: "longitudeOfAscendingNode",
						label: "longitude of ascending node",
						type: "range",
						default: 250,
						min: 0,
						max: 360,
					},
					{
						property: "argumentOfPeriapsis",
						label: "argument of periapsis",
						type: "range",
						default: 120,
						min: 0,
						max: 360,
					},
					{
						property: "meanLongitudeAtEpoch",
						label: "mean longitude at epoch",
						type: "range",
						default: 45,
						min: 0,
						max: 360,
					},
					{
						property: "rateOfChangeOfMeanLongitude",
						label: "rate of change of mean longitude",
						type: "range",
						default: 1800000,
						min: 0,
						max: 10000000,
					},
					{
						property: "longitudeOfPeriapsis",
						label: "longitude of periapsis",
						type: "range",
						default: 370,
						min: 0,
						max: 360,
					},
					{
						property: "apsidalPrecession",
						label: "apsidal precession",
						type: "range",
						default: 0.008,
						min: 0,
						max: 0.01,
					},
					{
						property: "inclinationDrift",
						label: "inclination drift",
						type: "range",
						default: 0.0015,
						min: 0,
						max: 0.01,
					},
				] as ControlsConfiguration[],
			}
		},
		methods: {},
		computed: {
			validControlsConfiguration(): ControlsConfiguration[] {
				const validControls = this.controlsConfiguration.filter((control) => {
					if (control.property in this.planet) {
						return true
					} else {
						console.error(`Property ${control.property} not found in planet`)
						return false
					}
				})
				return validControls
			},
		},
	})
</script>

<style lang="scss" scoped>
	.planet-controls-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}
</style>
