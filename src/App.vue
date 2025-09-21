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
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue"
	import * as THREE from "three"
	import ThreeScene from "./components/ThreeScene.vue"
	import BodyToFollow from "./components/BodyToFollow.vue"

	export default defineComponent({
		name: "App",
		components: { ThreeScene, BodyToFollow },
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
						radius: 1.5,
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
						apsidalPrecession: 0.01,
						inclinationDrift: 0.001,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "mars",
						colour: 0x993333,
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
						apsidalPrecession: 0, // how much does the orbit "swing" around its vertical axis
						inclinationDrift: 0.01,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "cluny",
						colour: 0x888888,
						radius: 2.5,
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
						apsidalPrecession: 0.001,
						inclinationDrift: 0.0001, // how much does the inclination change over time
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "elysium",
						colour: 0xffcc00,
						radius: 1,
						maxOrbitLength: 10000,
						semiMajorAxis: 5,
						eccentricity: 0.02,
						inclination: THREE.MathUtils.degToRad(2),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(45),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(100),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(80),
						rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(47000),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(145), // W + w
						apsidalPrecession: 0.005,
						inclinationDrift: 0.0005,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "zephyrus",
						colour: 0x66ccff,
						radius: 4,
						maxOrbitLength: 10000,
						semiMajorAxis: 3.5,
						eccentricity: 0.2,
						inclination: THREE.MathUtils.degToRad(10),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(110),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(90),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(20),
						rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(10000),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(200), // W + w
						apsidalPrecession: 0.002,
						inclinationDrift: 0.0002,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "noctis",
						colour: 0x9900cc,
						radius: 2,
						maxOrbitLength: 10000,
						semiMajorAxis: 1.2,
						eccentricity: 0.4,
						inclination: THREE.MathUtils.degToRad(135),
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(250),
						argumentOfPeriapsis: THREE.MathUtils.degToRad(120),
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(45),
						rateOfChangeOfMeanLongitude: THREE.MathUtils.degToRad(1800000),
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(370),
						apsidalPrecession: 0.008,
						inclinationDrift: 0.0015,
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
				],
			}
		},
		methods: {
			handleBodyToFollowChange(bodyToFollow: string): void {
				this.controlsTarget = bodyToFollow
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
