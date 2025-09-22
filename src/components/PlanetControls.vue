<template>
	<div class="planet-controls-wrapper">
		<p class="control-title">{{ planet.name }}</p>
		<p class="control-position">
			Coords: x {{ currentPosition.x }}, y {{ currentPosition.y }}, z
			{{ currentPosition.z }}
		</p>
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
						step: 0.1,
					},
					{
						property: "trailOpacity",
						label: "trail opacity",
						type: "range",
						default: 0.5,
						min: 0,
						max: 1,
						step: 0.01,
					},
					{
						property: "maxOrbitLength",
						label: "maximum trail length",
						type: "range",
						default: 10000,
						min: 0,
						max: 100000,
						step: 1,
					},
					{
						property: "semiMajorAxis",
						label: "semi-major axis",
						type: "range",
						default: 1.2,
						min: 0.01,
						max: 100,
						step: 0.01,
					},
					{
						property: "eccentricity",
						label: "eccentricity",
						type: "range",
						default: 0,
						min: 0,
						max: 0.99,
						step: 0.01,
					},
					{
						property: "inclination",
						label: "inclination",
						type: "range",
						default: 135,
						min: 0,
						max: 180,
						step: 0.1,
					},
					{
						property: "longitudeOfAscendingNode",
						label: "longitude of ascending node",
						type: "range",
						default: 250,
						min: 0,
						max: 360,
						step: 0.1,
					},
					{
						property: "argumentOfPeriapsis",
						label: "argument of periapsis",
						type: "range",
						default: 120,
						min: 0,
						max: 360,
						step: 0.1,
					},
					{
						property: "meanLongitudeAtEpoch",
						label: "mean longitude at epoch",
						type: "range",
						default: 45,
						min: 0,
						max: 360,
						step: 0.1,
					},
					{
						property: "rateOfChangeOfMeanLongitude",
						label: "rate of change of mean longitude",
						type: "range",
						default: 1800000,
						min: 0,
						max: 10000000,
						step: 1000,
					},
					{
						property: "longitudeOfPeriapsis",
						label: "longitude of periapsis",
						type: "range",
						default: 370,
						min: 0,
						max: 360,
						step: 0.1,
					},
					{
						property: "apsidalPrecession",
						label: "apsidal precession",
						type: "range",
						default: 0.008,
						min: 0,
						max: 0.01,
						step: 0.001,
					},
					{
						property: "inclinationDrift",
						label: "inclination drift",
						type: "range",
						default: 0.0015,
						min: 0,
						max: 0.01,
						step: 0.001,
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
			currentPosition(): { x: string; y: string; z: string } {
				const resultIfNoData = "???"
				return {
					x: this.planet._objectData?.position?.x?.toFixed(2) || resultIfNoData,
					y: this.planet._objectData?.position?.y?.toFixed(2) || resultIfNoData,
					z: this.planet._objectData?.position?.z?.toFixed(2) || resultIfNoData,
				}
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
