import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Loading from '../common/Loading';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
	const { isAuthenticated, isLoading: isAuthenticating } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticating && !isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, navigate, isAuthenticating]);

	if (isAuthenticating) {
		return <Loading fullHeight />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
