export const tokenManager = {
	getAccessToken: () => localStorage.getItem('AccessToken'),
	setAccessToken: (accessToken: string) =>
		localStorage.setItem('AccessToken', accessToken),
	clearAccessToken: () => localStorage.removeItem('AccessToken'),
};
