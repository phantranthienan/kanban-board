import React, { createContext, useState, useEffect, ReactNode } from 'react';

import { TUser } from '../types/common/users';
import { tokenManager } from '../utils/tokenManager';
import { getAccessToken, getMyInfo } from '../services/api/authApi';

interface AuthContextProps {
	user: TUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	authenticate: (user: TUser) => void;
	unAuthenticate: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<TUser | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const initializeAuth = async () => {
		try {
			await getAccessToken();
			const user = await getMyInfo();
			authenticate(user);
		} catch (error: unknown) {
			console.error(error);
			unAuthenticate();
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		initializeAuth();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const authenticate = (user: TUser) => {
		setUser(user);
		setIsAuthenticated(true);
	};

	const unAuthenticate = () => {
		setUser(null);
		setIsAuthenticated(false);
		tokenManager.clearAccessToken();
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				authenticate,
				unAuthenticate,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
