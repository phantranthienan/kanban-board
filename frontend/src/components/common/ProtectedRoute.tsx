import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
	const { hasToken, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!hasToken || !isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [hasToken, navigate, isAuthenticated]);

	return <Outlet />;
};

export default ProtectedRoute;
