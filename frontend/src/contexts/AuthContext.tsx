import React, {
	createContext,
	useState,
	useEffect,
	useMemo,
	ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useLoginMutation,
	useGetUserInfoQuery,
} from '../redux/slices/api/authApiSlice';

import { TUser } from '../types/users';
import { LoginInput } from '../utils/zodSchemas';
import { tokenManager } from '../utils/tokenManager';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface AuthContextProps {
	isAuthenticated: boolean;
	user: TUser | null;
	login: (credentials: LoginInput) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<TUser | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		!!tokenManager.getToken(),
	);

	const navigate = useNavigate();

	const { data: userInfo, error } = useGetUserInfoQuery(undefined, {
		skip: !isAuthenticated,
		refetchOnReconnect: true,
	});

	const [loginMutation] = useLoginMutation();

	useEffect(() => {
		if ((error as FetchBaseQueryError)?.status === 401) {
			logout();
		} else if (userInfo) {
			setUser(userInfo);
			setIsAuthenticated(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userInfo, error]);

	// Function to handle login
	const login = async (credentials: LoginInput) => {
		try {
			const { token } = await loginMutation(credentials).unwrap();
			tokenManager.setToken(token);
			setIsAuthenticated(true);
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(error.message);
			}
		}
	};

	// Function to handle logout
	const logout = () => {
		tokenManager.clearToken();
		setUser(null);
		setIsAuthenticated(false);
		navigate('/login', { replace: true });
	};

	const authContextValue = useMemo(
		() => ({
			isAuthenticated,
			user,
			login,
			logout,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isAuthenticated, user],
	);

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
