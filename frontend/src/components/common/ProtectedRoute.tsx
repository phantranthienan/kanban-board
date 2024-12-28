import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Loading from './Loading';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
	const { hasToken, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!hasToken) {
			navigate('/login', { replace: true });
		}
	}, [hasToken, navigate]);

	if (!isAuthenticated) {
		return <Loading fullHeight />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
