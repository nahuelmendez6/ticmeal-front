const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface BackofficeLoginResponse {
  access_token: string;
}

export const loginBackoffice = async (username: string, password: string): Promise<BackofficeLoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/backoffice/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al iniciar sesión en el backoffice');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en loginBackoffice:', error);
    throw error;
  }
};