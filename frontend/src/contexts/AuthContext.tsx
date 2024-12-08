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

	const {
		data: userInfo,
		error,
		refetch: refetchUser,
	} = useGetUserInfoQuery(undefined, {
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
	}, [userInfo, error]); // eslint-disable-line react-hooks/exhaustive-deps

	const login = async (credentials: LoginInput) => {
		const { token } = await loginMutation(credentials).unwrap();
		tokenManager.setToken(token);
		setIsAuthenticated(true);
		// Immediately refetch user info so `user` is updated ASAP
		await refetchUser();
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
		[isAuthenticated, user], // eslint-disable-line react-hooks/exhaustive-deps
	);

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
