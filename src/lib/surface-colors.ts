import { useColorScheme } from 'nativewind';

export type SurfaceColors = {
  background: string;
  foreground: string;
  border: string;
  muted: string;
  mutedForeground: string;
};

const LIGHT: SurfaceColors = {
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(240, 10%, 3.9%)',
  border: 'hsl(240, 5.9%, 90%)',
  muted: 'hsl(240, 4.8%, 95.9%)',
  mutedForeground: 'hsl(240, 3.8%, 46.1%)',
};

const DARK: SurfaceColors = {
  background: 'hsl(240, 10%, 3.9%)',
  foreground: 'hsl(0, 0%, 98%)',
  border: 'hsl(240, 3.7%, 15.9%)',
  muted: 'hsl(240, 3.7%, 15.9%)',
  mutedForeground: 'hsl(240, 5%, 64.9%)',
};

export function useSurfaceColors(): SurfaceColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? DARK : LIGHT;
}
