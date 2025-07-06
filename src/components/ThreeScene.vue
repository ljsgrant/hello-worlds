<template>
	<div class="three-scene-wrapper">
		<canvas ref="threeCanvas"></canvas>
	</div>
</template>

<script lang="ts">
	import * as THREE from "three"
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
	import { defineComponent } from "vue"

	import planetsData from "../data/planets.json" with { type: "json" }
	import type { OrbitalParameters } from "../types/types.ts"

	declare module "three/examples/jsm/controls/OrbitControls.js"

	export default defineComponent({
		name: "ThreeScene",
		data() {
			return {
				clock: new THREE.Clock(),
				scene: null as THREE.Scene | null,
				camera: null as THREE.PerspectiveCamera | null,
				renderer: null as THREE.WebGLRenderer | null,
				controls: null as OrbitControls | null,
				planets: planetsData.planets,
			}
		},
		mounted() {
			this.initScene()
			this.initPlanets()
		},
		methods: {
			initScene(): void {
				const canvas = this.$refs.threeCanvas as HTMLCanvasElement
				this.scene = new THREE.Scene()
				this.camera = this.initCamera(canvas)
				this.renderer = this.initRenderer(canvas)
				this.controls = this.initControls(this.camera, this.renderer)
				this.initLights(this.scene)

				// TODO: place`holder debug code, remove
				const geometry = new THREE.BoxGeometry()
				const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
				const cube = new THREE.Mesh(geometry, material)
				this.scene.add(cube)

				this.animate()
			},
			initCamera(canvas: HTMLCanvasElement): THREE.PerspectiveCamera {
				const camera = new THREE.PerspectiveCamera(
					75,
					window.innerWidth / window.innerHeight,
					0.1,
					1000,
				)
				camera.position.y = 2
				camera.rotation.x = this.degreesToRadians(-90)
				return camera
			},
			initRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
				const renderer = new THREE.WebGLRenderer({ canvas })
				renderer.setSize(window.innerWidth, window.innerHeight)
				return renderer
			},
			initLights(scene: THREE.Scene): void {
				const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
				scene.add(ambientLight)

				const light = new THREE.PointLight(0xffffff, 3)
				light.position.set(0, 0, 0)
				scene.add(light)
			},
			initControls(
				camera: THREE.PerspectiveCamera,
				renderer: THREE.WebGLRenderer,
			): OrbitControls {
				const controls: OrbitControls = new OrbitControls(
					camera,
					renderer.domElement,
				)
				controls.target.set(0, 0, 0)
				controls.update()
				return controls
			},
			initPlanets(): void {
				this.planets.forEach((planet) => {
					console.log(Object.entries(planet))

					const orbitParams: OrbitalParameters =
						(planet.orbit as OrbitalParameters) || {}
					const {
						parent,
						speed,
						semiMajorAxis_a,
						semiMinorAxis_b,
						semiParameter,
						apoapsis,
						periapsis,
						direction,
						inclination,
						longitudeOfAscendingNode,
					} = orbitParams
					const eccentricity = semiMajorAxis_a > 0 ? Math.sqrt(
						1 -
							(semiMinorAxis_b * semiMinorAxis_b) /
								(semiMajorAxis_a * semiMajorAxis_a)
					): Math.sqrt(
						1 +
							(semiMinorAxis_b * semiMinorAxis_b) /
								(semiMajorAxis_a * semiMajorAxis_a)
					)
					console.log(
						`Planet: ${planet.name}, Eccentricity: ${eccentricity}`
					)
				})
			},
			animate(): void {
				requestAnimationFrame(this.animate)
				const deltaTime = this.clock.getDelta()
				if (this.controls) this.controls.update(deltaTime)
				if (this.renderer && this.scene && this.camera) {
					this.renderer.render(this.scene, this.camera)
				}
			},
			degreesToRadians(degrees: number): number {
				return (degrees * Math.PI) / 180
			},
		},
	})
</script>
