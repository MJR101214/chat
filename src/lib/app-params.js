/**
 * @param {string} str
 * @returns {string}
 */
const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Simple app parameters
 * No Base44 backend parameters needed - using local storage
 */
const getAppParams = () => {
	return {
		appName: 'GMSChat',
		version: '0.0.1'
	};
}

export const appParams = {
	...getAppParams()
}
