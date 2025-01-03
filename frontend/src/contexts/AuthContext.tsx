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
	hasToken: boolean;
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

	const hasToken = !!tokenManager.getToken();
	const isAuthenticated = !!user;

	const navigate = useNavigate();

	const {
		data: userInfo,
		error,
		refetch,
	} = useGetUserInfoQuery(undefined, {
		skip: !hasToken && !isAuthenticated,
		refetchOnReconnect: true,
	});

	const [loginMutation] = useLoginMutation();

	const login = async (credentials: LoginInput) => {
		const { token, user } = await loginMutation(credentials).unwrap();
		setUser(user);
		tokenManager.setToken(token);
		navigate('/boards', { replace: true });
	};

	const logout = () => {
		tokenManager.clearToken();
		setUser(null);
		navigate('/login', { replace: true });
	};

	useEffect(() => {
		if (!user && hasToken) {
			refetch();
		}
	}, [hasToken, refetch, user]);

	useEffect(() => {
		if (userInfo) {
			setUser(userInfo);
		} else if ((error as FetchBaseQueryError)?.status === 401) {
			logout();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userInfo, error, hasToken]);

	const authContextValue = useMemo(
		() => ({ hasToken, isAuthenticated, user, login, logout }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[hasToken, isAuthenticated, user],
	);

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
