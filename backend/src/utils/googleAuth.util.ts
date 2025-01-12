import { OAuth2Client } from "google-auth-library";
import config from "@/config";

export type GoogleUserInfo = {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

const client = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
);

/**
 * Generates the Google authorization URL for the consent screen.
 * @returns Google OAuth2 consent screen URL
 */
export const generateAuthUrl = (): string => {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        prompt: 'consent',
    });
};

/**
 * Exchanges the authorization code for tokens (access and refresh tokens).
 * @param code - Authorization code returned by Google
 * @returns Tokens and user information
 */
export const getTokenInfo = async (code: string) => {
    const { tokens } = await client.getToken(code); // Exchange code for tokens
    client.setCredentials(tokens); // Set tokens for subsequent requests

    const response = await client.request<{ data: GoogleUserInfo }>({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });
    return { tokens, userInfo: response.data.data };
};