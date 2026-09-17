import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { changePasswordRequest, loginRequest, logoutRequest, meRequest } from '../api/auth';

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      const { accessToken, admin, mustChangePassword } = data;

      useAuthStore.getState().setAccessToken(accessToken);
      useAuthStore.getState().setAdmin({ admin });

      // Resolve permissions before flipping status to authenticated.
      const me = await meRequest();
      useAuthStore.getState().setSession({
        accessToken,
        admin: me.admin ?? admin,
        permissions: me.permissions || [],
        mustChangePassword: Boolean(mustChangePassword),
      });

      queryClient.clear();

      if (mustChangePassword) navigate('/change-password', { replace: true });
      else navigate('/dashboard', { replace: true });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({ mutationFn: changePasswordRequest });
};
