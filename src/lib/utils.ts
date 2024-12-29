import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(secs: number) {
	const pad = (n: number) => (n < 10 ? `0${n}` : n);
	const h = Math.floor(secs / 3600);
	const m = Math.floor(secs / 60) - h * 60;
	const s = Math.floor(secs - h * 3600 - m * 60);

	return `${pad(m)}:${pad(s)}`;
}

export function generateRandomString(length: number) {
	return new Array(length)
		.fill(0)
		.map((c) =>
			(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
		)
		.join('');
}
