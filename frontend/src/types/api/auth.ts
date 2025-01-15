import { TUser } from '../common/users';
import { LoginInput, RegisterInput } from '../../utils/validators/authSchemas';

// Request types
export type LoginRequest = LoginInput;
export type GoogleLoginRequest = {
	code: string;
};
export type RegisterRequest = RegisterInput;
export type GetAccessTokenRequest = void;
export type GetMeRequest = void;

// Response types
export type LoginResponse = {
	accessToken: string;
	user: TUser;
};
export type RegisterResponse = TUser;

export type GetAccessTokenResponse = {
	accessToken: string;
};
export type GetMeResponse = TUser;
