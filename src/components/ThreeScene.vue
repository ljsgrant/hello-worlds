<template>
	<div class="three-scene-wrapper">
		<canvas ref="threeCanvas"></canvas>
	</div>
</template>

<script lang="ts">
	import * as THREE from "three"
	import { defineComponent } from "vue"
	import type { PropType } from "vue"
	import type { Star, Planet } from "../types/types"
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
	import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
	import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
	import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js"

	declare module "three/examples/jsm/controls/OrbitControls.js"

	export default defineComponent({
		name: "ThreeScene",
		props: {
			star: {
				type: Object as PropType<Star>,
				required: true,
			},
			planets: {
				type: Array as PropType<Planet[]>,
				required: true,
			},
			controlsTarget: {
				type: String,
				required: true,
			},
		},
		data() {
			return {
				previousFrameControlsTarget: null as string | null,
				scene: null as THREE.Scene | null,
				camera: null as THREE.PerspectiveCamera | null,
				renderer: null as THREE.WebGLRenderer | null,
				composer: null as EffectComposer | null,
				controls: null as OrbitControls | null,
				animationFrameId: null as number | null,
				intitialCameraY: 10,
				endCameraTrackY: 150,
				finishedCameraTrack: false,
				cameraInnerLimit: 10,
				cameraOuterLimit: 500,
				clock: new THREE.Clock(),
				simulatedTime: 0,
				useActualElapsedTime: false,
				satellite: null as THREE.Mesh | null,
				J2000_EPOCH: Date.UTC(2000, 0, 1, 12, 0, 0),
				speedMultiplier: 10000000,
				AU: 100, // 1 AU = 100 Three.js units
				planetScale: 1, // base radius for planet spheres
			}
		},
		mounted() {
			this.scene = this.initScene()

			window.addEventListener("resize", this.handleCameraAndRendererSize, false)

			this.initStar(this.scene)
			this.initPlanets(this.scene)
		},
		beforeDestroy() {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId)
			}
			window.removeEventListener(
				"resize",
				this.handleCameraAndRendererSize,
				false,
			)
		},
		methods: {
			handleCameraAndRendererSize() {
				if (this.camera && this.renderer) {
					const canvas = this.$refs.threeCanvas as HTMLCanvasElement
					const parent = canvas.parentElement
					if (!parent) {
						throw new Error("Canvas has no parent element.")
					}

					const width = parent.clientWidth
					const height = parent.clientHeight

					this.camera.aspect = width / height
					this.camera.updateProjectionMatrix()

					this.renderer.setSize(width, height)
					if (this.composer) {
						this.composer.setSize(width, height)
						// const bloomPass = this.composer.passes.find(
						// 	(p) => p instanceof UnrealBloomPass,
						// )
						// if (bloomPass) {
						// 	bloomPass.resolution.set(width, height)
						// }
					}

					// this.renderer.setSize(window.innerWidth, window.innerHeight)
				}
			},
			initScene(): THREE.Scene {
				const canvas = this.$refs.threeCanvas as HTMLCanvasElement
				const scene = new THREE.Scene()
				this.camera = this.initCamera(canvas)
				this.renderer = this.initRenderer(canvas, scene)
				this.handleCameraAndRendererSize()
				this.controls = this.initControls(this.camera, this.renderer)

				this.animate()
				return scene
			},
			initCamera(canvas: HTMLCanvasElement): THREE.PerspectiveCamera {
				const camera = new THREE.PerspectiveCamera(
					75,
					window.innerWidth / window.innerHeight,
					0.1,
					2000,
				)
				camera.position.y = this.intitialCameraY
				camera.rotation.x = this.degreesToRadians(-90)
				return camera
			},
			initRenderer(
				canvas: HTMLCanvasElement,
				scene: THREE.Scene,
			): THREE.WebGLRenderer {
				const renderer = new THREE.WebGLRenderer({
					canvas,
					powerPreference: "high-performance",
					antialias: true,
				})

				const parent = canvas.parentElement
				if (!parent) {
					throw new Error("Canvas has no parent element.")
				}

				const width = parent.clientWidth
				const height = parent.clientHeight

				renderer.setSize(width, height)
				renderer.setPixelRatio(window.devicePixelRatio)

				if (scene && this.camera) {
					this.composer = new EffectComposer(renderer)
					this.composer.addPass(new RenderPass(scene, this.camera))
					const size = new THREE.Vector2()
					renderer.getSize(size)
					console.log("Renderer size:", size.x, size.y)
					// this.composer.addPass(new UnrealBloomPass(size, 0.5, 0.2, 0.5))
					const bloomPass = new BloomPass(1, 25, 4.0)
					bloomPass.renderToScreen = true
					console.log("len", bloomPass)

					this.composer.addPass(bloomPass)
				}

				return renderer
			},
			// initLights(scene: THREE.Scene): void {
			// 	const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
			// 	scene.add(ambientLight)

			// 	const light = new THREE.PointLight(0xffffff, 3)
			// 	light.position.set(0, 0, 0)
			// 	scene.add(light)
			// },
			initControls(
				camera: THREE.PerspectiveCamera,
				renderer: THREE.WebGLRenderer,
			): OrbitControls {
				const controls: OrbitControls = new OrbitControls(
					camera,
					renderer.domElement,
				)
				controls.enablePan = false
				controls.autoRotate = true
				controls.autoRotateSpeed = 1.0
				controls.target.set(0, 0, 0)
				controls.update()
				return controls
			},
			initStar(scene: THREE.Scene): void {
				const starGeometry = new THREE.SphereGeometry(this.star.radius, 32, 32)
				const starMaterial = new THREE.MeshStandardMaterial({
					color: this.star.colour,
					emissive: this.star.colour,
					emissiveIntensity: 100,
				})

				this.star._objectData = new THREE.Mesh(starGeometry, starMaterial)
				this.star._objectData.name = this.star.name

				scene.add(this.star._objectData)

				const white = new THREE.Color(0xffffff)

				const starLight = new THREE.PointLight(white, 100000)
				starLight.position.set(0, 0, 0)

				scene.add(starLight)
			},
			initPlanets(scene: THREE.Scene): void {
				for (const planet of this.planets) {
					const satelliteGeometry = new THREE.SphereGeometry(
						planet.radius,
						32,
						32,
					)
					const satelliteMaterial = new THREE.MeshStandardMaterial({
						color: planet.colour,
					})
					planet._objectData = new THREE.Mesh(
						satelliteGeometry,
						satelliteMaterial,
					)
					planet._objectData.name = planet.name
					scene.add(planet._objectData)
				}
			},
			animate(): void {
				this.animationFrameId = requestAnimationFrame(this.animate)
				const deltaTime = this.clock.getDelta()
				if (this.controls) this.controls.update(deltaTime)

				if (!this.useActualElapsedTime) {
					const timeStep = deltaTime * this.speedMultiplier
					this.simulatedTime += timeStep
				}

				const now = this.useActualElapsedTime ? Date.now() : this.simulatedTime

				for (const planet of this.planets) {
					const pos = this.orbitalPosition(planet, now)
					if (planet._objectData) {
						planet._objectData.position.copy(pos)
						planet.argumentOfPeriapsis += planet.apsidalPrecession
						planet.inclination += planet.inclinationDrift
					}

					planet._orbitPoints.push(pos)
					if (planet._orbitPoints.length > planet.maxOrbitLength) {
						planet._orbitPoints.shift()
					}

					this.updateOrbitPath(planet)
				}

				if (this.renderer && this.scene && this.camera) {
					this.renderer.render(this.scene, this.camera)
					if (this.composer) {
						this.composer.render()
					}
				}

				if (this.camera) {
					if (
						this.camera &&
						!this.finishedCameraTrack &&
						this.camera.position.y < this.endCameraTrackY
					) {
						this.camera.position.y += 1

						if (this.camera.position.y >= this.endCameraTrackY) {
							this.finishedCameraTrack = true
						}
					}

					// for (const axis of ["x", "y", "z"]) {
					// 	if (
					// 		this.camera.position[axis as "x" | "y" | "z"] >=
					// 		this.cameraOuterLimit
					// 	) {
					// 		this.camera.position[axis as "x" | "y" | "z"] -= 20
					// 	}

					// 	if (
					// 		this.camera.position[axis as "x" | "y" | "z"] <=
					// 		this.cameraInnerLimit
					// 	) {
					// 		this.camera.position[axis as "x" | "y" | "z"] += 0.1
					// 	}
					// }
				}

				if (this.controls && this.controlsTarget) {
					const targets = [this.star, ...this.planets]
					const targetBody = targets.find(
						(p) => p.name.toLowerCase() === this.controlsTarget.toLowerCase(),
					)
					if (targetBody) {
						const { x, y, z } = targetBody?._objectData?.position || {
							x: 0,
							y: 0,
							z: 0,
						}
						this.controls.target.set(x, y, z)
					}
				}
			},
			degreesToRadians(degrees: number): number {
				return (degrees * Math.PI) / 180
			},
			updateOrbitPath(planet: Planet): void {
				if (
					!planet ||
					planet.maxOrbitLength < 2 ||
					planet._orbitPoints.length < 2
				) {
					return
				}

				const planetPosition = planet._objectData?.position

				const orbitCurve = new THREE.CatmullRomCurve3(
					planet._orbitPoints,
					false,
					"catmullrom",
					0.5,
				)

				const interpolatedOrbitCurvePoints = orbitCurve.getPoints(
					planet._orbitPoints.length,
				)
				const orbitCurveGeometry = new THREE.BufferGeometry().setFromPoints(
					interpolatedOrbitCurvePoints,
				)
				const material = new THREE.LineBasicMaterial({
					color: planet.colour,
					transparent: true,
					opacity: planet.trailOpacity,
				})
				const orbitPathObject = new THREE.Line(orbitCurveGeometry, material)

				const previousCurve = planet._orbitCurve as THREE.Line | null
				if (previousCurve) {
					previousCurve.geometry.dispose()
					if (Array.isArray(previousCurve.material)) {
						previousCurve.material.forEach((m) => m.dispose())
					} else {
						previousCurve.material.dispose()
					}
					this.scene?.remove(previousCurve)
				}

				this.scene?.add(orbitPathObject)
				planet._orbitCurve = null
				planet._orbitCurve = orbitPathObject
			},
			orbitalPosition(elements: Planet, time: number): THREE.Vector3 {
				const {
					semiMajorAxis, // (a) - semi-major axis (in AU)
					eccentricity, // (e) - Eccentricity
					inclination, // (i) - Inclination (radians)
					longitudeOfAscendingNode, // (W) - Longitude of ascending node Ω (radians)
					argumentOfPeriapsis, // (w) - Argument of periapsis ω (radians)
					meanLongitudeAtEpoch, // (L0) - Mean longitude at epoch (radians)
					rateOfChangeOfMeanLongitude, // (Ldot) - Rate of change of mean longitude (radians per Julian century)
					longitudeOfPeriapsis, // (p) - Longitude of periapsis (radians) = W + w
				} = elements

				// Time from J2000 in Julian centuries
				const tMillisFromJ2000 = Date.now() - this.J2000_EPOCH
				const t =
					((Date.now() - this.J2000_EPOCH) /
						(1000 * 60 * 60 * 24 * 365.25 * 100)) *
					this.speedMultiplier

				// Mean longitude (including precession)
				const calculatedMeanLongitude =
					meanLongitudeAtEpoch + rateOfChangeOfMeanLongitude * t

				const calculatedMeanAnomaly =
					calculatedMeanLongitude - longitudeOfPeriapsis // Mean anomaly (radians)

				// Solve Kepler's Equation: M = E - e * sin(E)
				let eccentricAnomaly = calculatedMeanAnomaly
				for (let iter = 0; iter < 10; iter++) {
					const deltaEccentricAnomaly =
						(eccentricAnomaly -
							eccentricity * Math.sin(eccentricAnomaly) -
							calculatedMeanAnomaly) /
						(1 - eccentricity * Math.cos(eccentricAnomaly))
					eccentricAnomaly -= deltaEccentricAnomaly

					const convergenceThreshold = 1e-6
					if (Math.abs(deltaEccentricAnomaly) < convergenceThreshold) break
				}
				// deltaEccentricAnomaly is the delta step used to update the eccentric anomaly
				// during the iterative solution of Kepler’s Equation using Newton-Raphson.
				// It's how far the current guess for eccentricAnomaly is from the solution,
				// based on the current estimate.

				// P and Q (2D position in orbital plane - analogous to x and y, or U & V)
				const P = semiMajorAxis * (Math.cos(eccentricAnomaly) - eccentricity)
				const Q =
					semiMajorAxis *
					Math.sin(eccentricAnomaly) *
					Math.sqrt(1 - eccentricity * eccentricity)

				// Convert to 3D space
				let x =
					Math.cos(argumentOfPeriapsis) * P - Math.sin(argumentOfPeriapsis) * Q
				let y =
					Math.sin(argumentOfPeriapsis) * P + Math.cos(argumentOfPeriapsis) * Q
				let z = 0

				// Inclination
				z = Math.sin(inclination) * y
				y = Math.cos(inclination) * y

				// Longitude of ascending node
				const xtemp = x
				x =
					Math.cos(longitudeOfAscendingNode) * xtemp -
					Math.sin(longitudeOfAscendingNode) * y
				y =
					Math.sin(longitudeOfAscendingNode) * xtemp +
					Math.cos(longitudeOfAscendingNode) * y

				// Convert AU to threejs units
				const AU = 150
				return new THREE.Vector3(x * AU, y * AU, z * AU)
			},
		},
	})
</script>

<style lang="scss" scoped>
	.three-scene-wrapper {
		width: 100%;
		height: 100%;
		max-height: 90vh;
		aspect-ratio: 2;
	}

	canvas {
		width: 100%;
		height: 100%;
		border: 5px solid white;
		box-sizing: border-box;
		border-radius: 32px;
	}
</style>
