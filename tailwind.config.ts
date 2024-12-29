import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';
import ContainerQueries from '@tailwindcss/container-queries';

const config: Config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)'
				}
			},
			fontFamily: {
				sans: ['Poppins', ...fontFamily.sans],
				mono: ['JetBrains Mono', ...fontFamily.mono]
			}
		}
	},
	plugins: [ContainerQueries]
};

export default config;
