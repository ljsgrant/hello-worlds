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
		maxOrbitLength: number
		semiMajorAxis: number // (a) (in AU)
		eccentricity: number // (e)
		inclination: number // (i) (radians)
		longitudeOfAscendingNode: number // (W) Ω (radians)
		argumentOfPeriapsis: number // (w) ω (radians)
		meanLongitudeAtEpoch: number // (L0) L (radians)
		rateOfChangeOfMeanLongitude: number // (Ldot) (radians per Julian century)
		longitudeOfPeriapsis: number // (p) (radians) = W + w
		apsidalPrecession: number // how much does the orbit "swing" around its vertical axis
		inclinationDrift: number // how much does the eccentricity change over time
		_objectData: THREE.Mesh | null
		_orbitLines: THREE.LineLoop[]
		_orbitPoints: THREE.Vector3[]
		_orbitCurve: THREE.Line | null
	}

	export default defineComponent({
		name: "ThreeScene",
		data() {
			return {
				scene: null as THREE.Scene | null,
				camera: null as THREE.PerspectiveCamera | null,
				renderer: null as THREE.WebGLRenderer | null,
				controls: null as OrbitControls | null,
				animationFrameId: null as number | null,
				clock: new THREE.Clock(),
				simulatedTime: 0,
				useActualElapsedTime: false,
				planetData: planetsJson.planets,
				starData: planetsJson.star,
				satellite: null as THREE.Mesh | null,
				J2000_EPOCH: Date.UTC(2000, 0, 1, 12, 0, 0),
				planets: [
					{
						name: "Earth",
						colour: 0x3399ff,
						radius: 1.5,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.5, // (a) - semi-major axis (in AU)
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
						inclinationDrift: 0.001, // how much does the eccentricity change over time
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
					{
						name: "Mars",
						colour: 0x993333,
						radius: 2.5,
						maxOrbitLength: 10000,
						semiMajorAxis: 0.95, // (a) - semi-major axis (in AU)
						eccentricity: 0.1, // (e) - Eccentricity
						inclination: THREE.MathUtils.degToRad(45), // (i) - Inclination (radians)
						longitudeOfAscendingNode: THREE.MathUtils.degToRad(-11.26064), // (W) - Longitude of ascending node Ω (radians)
						argumentOfPeriapsis: THREE.MathUtils.degToRad(150), // (w) - Argument of periapsis ω (radians)
						meanLongitudeAtEpoch: THREE.MathUtils.degToRad(10.46457166), // (L0) - Mean longitude at epoch (radians)
						rateOfChangeOfMeanLongitude:
							THREE.MathUtils.degToRad(35999.37244981), // (Ldot) - Rate of change of mean longitude (radians per Julian century)
						longitudeOfPeriapsis: THREE.MathUtils.degToRad(
							102.93768193 - -11.26064, // (p) - Longitude of periapsis (radians) = W + w
						), // (p) - Longitude of periapsis (radians) = W + w
						apsidalPrecession: 0, // how much does the orbit "swing" around its vertical axis
						inclinationDrift: 0.01, // how much does the inclination change over time
						_objectData: null as THREE.Mesh | null,
						_orbitLines: [] as THREE.LineLoop[],
						_orbitPoints: [] as THREE.Vector3[],
						_orbitCurve: null as THREE.Line | null,
					},
				],
				speedMultiplier: 20000000,
				AU: 100, // 1 AU = 100 Three.js units
				planetScale: 1, // base radius for planet spheres
			}
		},
		mounted() {
			this.scene = this.initScene()

			this.initStar(this.scene)
			this.initPlanets(this.scene)
		},
		beforeDestroy() {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId)
			}
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
				this.animationFrameId = requestAnimationFrame(this.animate)
				const deltaTime = this.clock.getDelta()
				if (this.controls) this.controls.update(deltaTime)

				if (!this.useActualElapsedTime) {
					const timeStep = deltaTime * this.speedMultiplier
					this.simulatedTime += timeStep
				}

				const now = this.useActualElapsedTime ? Date.now() : this.simulatedTime
				console.log(now)

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
