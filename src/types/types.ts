import * as THREE from "three"

export interface Star {
	name: string
	radius: number
	colour: string
	_objectData: THREE.Mesh | null
}

export type OrbitalParameters = {
	parent: string
	semiParameter: number
	apoapsis: number
	periapsis: number
	inclination: number
	longitudeOfAscendingNode: number
	argumentOfPeriapsis: number
	meanAnomaly: number
}

export interface Planet {
	name: string
	colour: number
	radius: number
	trailOpacity: number
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

export type ControlsConfiguration = {
	property: string
	label: string
	type: string
	default: string | number
	min?: number
	max?: number
	step?: number
}

export type ControlChangeEvent = ControlsConfiguration & {
	value: string | number
}

export type PlanetChangeEvent = ControlChangeEvent & {
	planetName: string
}
