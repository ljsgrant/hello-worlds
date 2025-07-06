export type OrbitalParameters = {
	parent: string
	speed: number
	semiMajorAxis_a: number
	semiMinorAxis_b: number
	semiParameter: number
	apoapsis: number
	periapsis: number
	direction: "clockwise" | "counterclockwise"
	inclination: number
	longitudeOfAscendingNode: number
}
