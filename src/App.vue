<template>
	<div id="app">
		<div class="header">
			<div class="logo">
				<p class="base">🪐</p>
				<p class="top">🚀</p>
			</div>
			<div class="title-wrapper">
				<h1 class="title">Hello, Worlds</h1>
				<h2 class="subtitle">A tiny planetary spirograph toy</h2>
			</div>
			<p class="disclaimer">
				No physics were harmed in the making of this software
			</p>
		</div>
		<div class="content">
			<ThreeScene
				:star="star"
				:planets="planets"
				:controls-target="controlsTarget"
			/>
		</div>
		<div class="controls">
			<BodyToFollow
				:star="star"
				:planets="planets"
				@body-to-follow="handleBodyToFollowChange"
			/>
			<div class="planet-controls-area">
				<div v-for="planet in planets" :key="planet.name">
					<PlanetControls
						:planet="planet"
						@change="handlePlanetChange($event)"
					/>
				</div>
				<button>Add New</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue"
	import * as THREE from "three"
	import ThreeScene from "./components/ThreeScene.vue"
	import BodyToFollow from "./components/BodyToFollow.vue"
	import PlanetControls from "./components/PlanetControls.vue"
	import type { Star, Planet } from "./types/types"
	import type { PlanetChangeEvent } from "./types/types"

	export default defineComponent({
		name: "App",
		components: { ThreeScene, BodyToFollow, PlanetControls },
		data() {
			return {
				controlsTarget: "earth",
				star: {
					name: "sun",
					radius: 5,
					colour: "yellow",
					_objectData: null as THREE.Mesh | null,
				},
				planets: [
					{
						name: "earth",
						colour: 0x3399ff,
						trailOpacity: 0.5,
						radius: 3,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.5,
						eccentricity: 0.5,
						inclination: THREE.MathUtils.degToRad(10),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(5.26064),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166),
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064,
						),
						apsidalPrecession: 0.0001,
						inclinationDrift: 0.0001,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "mars",
						colour: 0x993333,
						trailOpacity: 0.5,
						radius: 2.5,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.95,
						eccentricity: 0.1,
						inclination: THREE.MathUtils.degToRad(45),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(-11.26064),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166),
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064,
						),
						apsidalPrecession: 0.0001, // how much does the orbit "swing" around its vertical axis
						inclinationDrift: 0.0001,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "cluny",
						colour: 0x888888,
						trailOpacity: 0.5,
						radius: 2.75,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.5,
						eccentricity: 0.75,
						inclination: THREE.MathUtils.degToRad(45),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(-22.26064),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166),
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064,
						),
						apsidalPrecession: 0.0001,
						inclinationDrift: 0.0001, // how much does the inclination change over time
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "elysium",
						colour: 0xffcc00,
						trailOpacity: 0.5,
						radius: 0,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.75,
						eccentricity: 0.02,
						inclination: THREE.MathUtils.degToRad(2),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(45),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(100),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(80),
						rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(47000),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(145), // W + w
						apsidalPrecession: 0.0001,
						inclinationDrift: 0.0001,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "zephyrus",
						colour: 0x66ccff,
						trailOpacity: 0.5,
						radius: 4,
						maxOrbitLength: 10000,
						semiMajorAxis: 1.15,
						eccentricity: 0.2,
						inclination: THREE.MathUtils.degToRad(10),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(110),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(90),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(20),
						rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(10000),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(200), // W + w
						apsidalPrecession: 0.0001,
						inclinationDrift: 0.0001,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					// {
					// 	name: "noctis",
					// 	colour: 0x9900cc,
					// 	trailOpacity: 0.5,
					// 	radius: 2,
					// 	maxOrbitLength: 10000,
					// 	semiMajorAxis: 1.2,
					// 	eccentricity: 0.4,
					// 	inclination: THREE.MathUtils.degToRad(135),
					// 	longitudeOfAscendingNode: THREE.MathUtils.degToRad(250),
					// 	argumentOfPeriapsis: THREE.MathUtils.degToRad(120),
					// 	meanLongitudeAtEpoch: THREE.MathUtils.degToRad(45),
					// 	rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(1800000),
					// 	longitudeOfPeriapsis: THREE.MathUtils.degToRad(370),
					// 	apsidalPrecession: 0.0001,
					// 	inclinationDrift: 0.0001,
					// 	_objectData: null as THREE.Mesh | null,
					// 	_orbitLines: [] as THREE.LineLoop[],
					// 	_orbitPoints: [] as THREE.Vector3[],
					// 	_orbitCurve: null as THREE.Line | null,
					// },
				],
			}
		},
		methods: {
			handleBodyToFollowChange(bodyToFollow: string): void {
				this.controlsTarget = bodyToFollow
			},
			handlePlanetChange(event: PlanetChangeEvent): void {
				const { planetName, property, value } = event
				const planetIndex = this.planets.findIndex((p) => p.name === planetName)
				const planet = this.planets[planetIndex]

				type PlanetKey = keyof Planet

				if (!planet || !property || value === undefined) return

				// Optional: check that the key exists on the Planet object
				if (property in planet) {
					// Optional: you can refine this even more if needed
					;(planet as any)[property] = value

					if (planet?._objectData?.material) {
						const material = planet._objectData.material

						if (Array.isArray(material)) {
							material.forEach((m) => (m.needsUpdate = true))
						} else {
							material.needsUpdate = true
						}
					}

					// _objectData: null as THREE.Mesh | null,
					// 	_orbitLines: [] as THREE.LineLoop[],
					// 	_orbitPoints: [] as THREE.Vector3[],
					// 	_orbitCurve: null as THREE.Line | null,
				}
			},
		},
	})
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-right: 11px;
		position: relative;

		.base {
			font-size: 42px;
		}

		.top {
			position: absolute;
			font-size: 30px;
		}
	}

	.disclaimer {
		font-size: 10px;
		margin-left: 12px;
		font-style: italic;
		margin-top: auto;
		margin-left: auto;
	}

	.planet-controls-area {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		width: 100%;
		overflow-x: scroll;
	}
</style>
