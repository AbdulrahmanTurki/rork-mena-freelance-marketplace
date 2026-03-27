import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { EscrowProvider } from '@/contexts/EscrowContext';

export default function AdminLayout() {
  const { theme } = useTheme();

  return (
    <EscrowProvider>
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.headerBackground,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    </EscrowProvider>
  );
}
