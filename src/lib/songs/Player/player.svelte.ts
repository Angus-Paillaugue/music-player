import type { Song } from '$lib/types';
import { get } from 'svelte/store';
import { songs } from '$lib/stores';

export class Player {
	private _playerElement: HTMLAudioElement;
	private _song = $state<Song | null>(null);
	private _songIndex = $state<number>(0);
	private _currentTime = $state<number>(0);
	private _percentage = $state<number>(0);
	private _isPlaying = $state<boolean>(false);
	private _songs: Song[] = [];

	play() {
		this._playerElement.play();
		this._isPlaying = true;
		this._playerElement.dispatchEvent(new Event('play'));
		this._playerElement.addEventListener('timeupdate', () => {
			this.onUpdateTime();
		});
	}

	pause() {
		this._playerElement.pause();
		this._isPlaying = false;
		this._playerElement.dispatchEvent(new Event('pause'));
		this._playerElement.removeEventListener('timeupdate', () => {
			this.onUpdateTime();
		});
	}

	constructor(parent: HTMLElement) {
		const audioComponent = document.createElement('audio');
		if (this._song) audioComponent.src = this._song.filePath;
		audioComponent.controls = false;
		audioComponent.autoplay = false;
		parent.appendChild(audioComponent);
		this._playerElement = audioComponent;
	}

	get isPlaying() {
		return this._isPlaying;
	}

	get song() {
		return this._song;
	}

	get currentTime() {
		return this._currentTime;
	}

	set currentTime(value: number) {
		this._currentTime = value;
		this._playerElement.currentTime = value;
	}

	get volume() {
		return this._playerElement.volume;
	}

	set volume(value: number) {
		this._playerElement.volume = value;
	}

	get muted() {
		return this?._playerElement.muted;
	}

	set muted(value: boolean) {
		this._playerElement.muted = value;
	}

	get percentage() {
		return this._percentage;
	}

	close() {
		this._song = null;
		this._playerElement.pause();
		this._playerElement.remove();
	}

	togglePlay() {
		if (!this._song) return;
		if (this.isPlaying) this.pause();
		else this.play();
	}

	onUpdateTime() {
		this._percentage = (this._playerElement.currentTime / this._playerElement.duration) * 100;
		this._currentTime = Math.floor(this._playerElement.currentTime);
		if (this._playerElement.currentTime >= this._playerElement.duration) {
			this.next();
		}
	}

	changeSong(song: Song) {
		this._song = song;
		this._playerElement.src = this._song.filePath;
		this._playerElement.load();
		this._playerElement.addEventListener(
			'canplay',
			() => {
				this.play();
			},
			{ once: true }
		);
		this._songIndex = get(songs)
			.map((s) => s.filePath)
			.indexOf(song.filePath);
	}

	destroy() {
		this.close();
	}

	next() {
		if (!this._song) return;
		const nextIndex = (this._songIndex + 1) % get(songs).length;
		this.changeSong(get(songs)[nextIndex]);
		this._playerElement.dispatchEvent(new Event('songChange'));
	}

	previous() {
		if (!this._song) return;
		const previousIndex = (this._songIndex - 1 + get(songs).length) % get(songs).length;
		this.changeSong(get(songs)[previousIndex]);
		this._playerElement.dispatchEvent(new Event('songChange'));
	}

	on(event: string, callback: (song: Song | null) => void) {
		this._playerElement.addEventListener(event, () => {
			callback(this._song);
		});
	}
}
