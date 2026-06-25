import { useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AppRouter } from "./router/AppRouter";
import {
  AuthContext,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
} from "./store/authStore";
import { authApi } from "./api/auth.api";
import type { AuthUser } from "./types/auth.types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ ownerState, theme }: any) => ({
          textTransform: "none",
          fontWeight: 600,
          ...(ownerState.variant === "contained" && {
            "&.Mui-disabled": {
              backgroundColor:
                ownerState.color === "success"
                  ? theme.palette.success.main
                  : ownerState.color === "error"
                    ? theme.palette.error.main
                    : ownerState.color === "info"
                      ? theme.palette.info.main
                      : ownerState.color === "secondary"
                        ? theme.palette.secondary.main
                        : theme.palette.primary.main,
              color: "rgba(255, 255, 255, 0.85)",
              opacity: 0.75,
            },
          }),
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: "1px solid #e0e0e0" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { border: "none", boxShadow: "none" },
      },
    },
  },
});

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredAuth);

  const authValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      login: (u: AuthUser, token: string) => {
        setUser(u);
        setStoredAuth(u, token);
      },
      logout: () => {
        authApi.logout().catch(() => {});
        queryClient.clear();
        setUser(null);
        clearStoredAuth();
      },
    }),
    [user],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={3000}
        >
          <AuthContext.Provider value={authValue}>
            <AppRouter />
          </AuthContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
