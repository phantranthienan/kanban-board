export const mapOrder = <T, K extends keyof T>(
	originalArray: T[],
	orderArray: T[K][], // Ensure orderArray contains the same type as the key in T
	key: K, // Ensure key is a valid key of T
): T[] => {
	if (!originalArray || !orderArray || !key) {
		return [];
	}

	// Clone the original array to avoid mutating it
	const clonedArray = [...originalArray];

	// Sort based on the index of the key value in orderArray
	const orderedArray = clonedArray.sort((a, b) => {
		return orderArray.indexOf(a[key]) - orderArray.indexOf(b[key]);
	});

	return orderedArray;
};
