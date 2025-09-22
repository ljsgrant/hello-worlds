export function numberToHexColor(number: number) {
	const hexColor = `#${number.toString(16).padStart(6, "0")}`
	return hexColor
}
