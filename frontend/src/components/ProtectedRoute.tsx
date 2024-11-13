import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;
