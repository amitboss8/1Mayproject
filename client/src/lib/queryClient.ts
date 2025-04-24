import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any,
  requiresAuth: boolean = false
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Clear potentially stale data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error('Authentication required');
    }
    
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    if (response.status === 401) {
      // Try to refresh token
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const newToken = await firebaseUser.getIdToken(true);
        localStorage.setItem('authToken', newToken);
        
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(path, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include'
        });
      }

      // If still unauthorized after refresh
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    throw new Error('Network error');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});