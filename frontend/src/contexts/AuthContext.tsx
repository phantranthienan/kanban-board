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

	// The query automatically runs if isAuthenticated = true
	const { data: userInfo, error } = useGetUserInfoQuery(undefined, {
		skip: !isAuthenticated,
		refetchOnReconnect: true,
	});

	const [loginMutation] = useLoginMutation();

	useEffect(() => {
		// If we get a 401 error, log out
		if ((error as FetchBaseQueryError)?.status === 401) {
			logout();
		} else if (userInfo) {
			// Once userInfo is fetched successfully, set user
			setUser(userInfo);
			setIsAuthenticated(true);
		}
	}, [userInfo, error]); // eslint-disable-line react-hooks/exhaustive-deps

	const login = async (credentials: LoginInput) => {
		const { token } = await loginMutation(credentials).unwrap();
		tokenManager.setToken(token);
		// Setting this to true triggers the query to run (no need to refetch manually)
		setIsAuthenticated(true);
	};

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
