<template>
	<div class="three-scene-wrapper">
		<canvas ref="threeCanvas"></canvas>
	</div>
</template>

<script lang="ts">
	import * as THREE from "three"
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
	import { defineComponent } from "vue"

	import planetsJson from "../data/planets.json" with { type: "json" }

	declare module "three/examples/jsm/controls/OrbitControls.js"

	interface Planet {
		name: string
		colour: number
		radius: number
		maxOrbitsToDraw: number
		_objectData: THREE.Mesh | null
		_orbitLines: THREE.LineLoop[]
		semiMajorAxis: number // (a) (in AU)
		eccentricity: number // (e)
		inclination: number // (i) (radians)
		longitudeOfAscendingNode: number // (W) Ω (radians)
		argumentOfPeriapsis: number // (w) ω (radians)
		meanLongitudeAtEpoch: number // (L0) L (radians)
		rateOfChangeOfMeanLongitude: number // (Ldot) (radians per Julian century)
		longitudeOfPeriapsis: number // (p) (radians) = W + w
	}

	export default defineComponent({
		name: "ThreeScene",
		data() {
			return {
				clock: new THREE.Clock(),
				scene: null as THREE.Scene | null,
				camera: null as THREE.PerspectiveCamera | null,
				renderer: null as THREE.WebGLRenderer | null,
				controls: null as OrbitControls | null,
				planetData: planetsJson.planets,
				starData: planetsJson.star,
				satellite: null as THREE.Mesh | null,
				J2000_EPOCH: Date.UTC(2000, 0, 1, 12, 0, 0),
				planets: [
					{
						name: "Earth",
						colour: 0x3399ff,
						radius: 0.5,
						maxOrbitsToDraw: 2,
						semiMajorAxis: 0.50000261, // (a) - semi-major axis (in AU)
						eccentricity: 0.5, // (e) - Eccentricity
						inclination: THREE.MathUtils.degToRad(10), // (i) - Inclination (radians)
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(-11.26064), // (W) - Longitude of ascending node Ω (radians)
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150), // (w) - Argument of periapsis ω (radians)
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166), // (L0) - Mean longitude at epoch (radians)
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981), // (Ldot) - Rate of change of mean longitude (radians per Julian century)
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064, // (p) - Longitude of periapsis (radians) = W + w
						), // (p) - Longitude of periapsis (radians) = W + w
						apsidalPrecession: 0.01, // how much does the orbit "swing" around its vertical axis
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
					},
					{
						name: "Mars",
						colour: 0x993333,
						radius: 0.5,
						maxOrbitsToDraw: 2,
						semiMajorAxis: 0.50000261, // (a) - semi-major axis (in AU)
						eccentricity: 0.5, // (e) - Eccentricity
						inclination: THREE.MathUtils.degToRad(45), // (i) - Inclination (radians)
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(-11.26064), // (W) - Longitude of ascending node Ω (radians)
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150), // (w) - Argument of periapsis ω (radians)
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166), // (L0) - Mean longitude at epoch (radians)
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981), // (Ldot) - Rate of change of mean longitude (radians per Julian century)
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064, // (p) - Longitude of periapsis (radians) = W + w
						), // (p) - Longitude of periapsis (radians) = W + w
						apsidalPrecession: 0.01, // how much does the orbit "swing" around its vertical axis
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
					},
				],
				speedMultiplier: 0.1,
				AU: 100, // 1 AU = 100 Three.js units
				planetScale: 1, // base radius for planet spheres
			}
		},
		mounted() {
			this.scene = this.initScene()

			this.initStar(this.scene)
			this.initPlanets(this.scene)
		},
		methods: {
			initScene(): THREE.Scene {
				const canvas = this.$refs.threeCanvas as HTMLCanvasElement
				const scene = new THREE.Scene()
				this.camera = this.initCamera(canvas)
				this.renderer = this.initRenderer(canvas)
				this.controls = this.initControls(this.camera, this.renderer)
				this.initLights(scene)

				this.animate()
				return scene
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
			initStar(scene: THREE.Scene): void {
				const star = this.starData
				const starGeometry = new THREE.SphereGeometry(star.radius, 32, 32)
				const starMaterial = new THREE.MeshStandardMaterial({
					color: star.colour,
					emissive: star.colour,
					emissiveIntensity: 1,
				})
				const starMesh = new THREE.Mesh(starGeometry, starMaterial)
				scene.add(starMesh)
			},
			initPlanets(scene: THREE.Scene): void {
				for (const planet of this.planets) {
					const satelliteGeometry = new THREE.SphereGeometry(
						planet.radius,
						32,
						32,
					)
					const satelliteMaterial = new THREE.MeshBasicMaterial({
						color: planet.colour,
					})
					planet._objectData = new THREE.Mesh(
						satelliteGeometry,
						satelliteMaterial,
					)
					scene.add(planet._objectData)
				}
			},
			animate(): void {
				requestAnimationFrame(this.animate)
				const deltaTime = this.clock.getDelta()
				if (this.controls) this.controls.update(deltaTime)

				const now = Date.now()

				for (const planet of this.planets) {
					const pos = this.orbitalPosition(planet, now)
					if (planet._objectData) {
						planet._objectData.position.copy(pos)
						planet.argumentOfPeriapsis += planet.apsidalPrecession
					}
					this.createOrbitPath(planet)
				}

				if (this.renderer && this.scene && this.camera) {
					this.renderer.render(this.scene, this.camera)
				}
			},
			degreesToRadians(degrees: number): number {
				return (degrees * Math.PI) / 180
			},
			createOrbitPath(planet: Planet): void {
				if (planet.maxOrbitsToDraw === 0) return

				const orbitPoints = []
				for (let deg = 0; deg < 360; deg += 1) {
					const meanAnomaly = THREE.MathUtils.degToRad(deg)
					const elementsCopy = {
						...planet,
						meanLongitudeAtEpoch: meanAnomaly + planet.longitudeOfPeriapsis,
					}

					const pos = this.orbitalPosition(elementsCopy, this.J2000_EPOCH)
					orbitPoints.push(pos)
				}
				const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
					orbitPoints,
				)
				const orbitMaterial = new THREE.LineBasicMaterial({
					color: planet.colour,
				})
				const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial)
				planet._orbitLines.push(orbitLine)
				if (planet._orbitLines.length > planet.maxOrbitsToDraw) {
					this.scene?.remove(planet._orbitLines.shift() as THREE.LineLoop)
				}
				this.scene?.add(orbitLine)
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

				// Convert AU to units you want (e.g., 1 AU = 150 units in Three.js)
				const AU = 150
				return new THREE.Vector3(x * AU, y * AU, z * AU)
			},
		},
	})
</script>
