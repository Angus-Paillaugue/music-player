<script lang="ts">
	import Alert from "$lib/components/Alert.svelte";
	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import type { Song } from "$lib/types";

  interface Props {
    songs: Song[];
  }
  let { songs = $bindable([]) }: Props = $props();
  let isDownloadingSong = $state<boolean>(false);
  let downloadSongModalOpen = $state<boolean>(false);
  let downloadError = $state<string | null>(null);

  async function downloadSong(e: Event) {
    e.preventDefault();
    isDownloadingSong = true;
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const songURL = new URL(formData.get('url') as string);
      const songId = songURL.searchParams.get('v');
      const res = await fetch(`/api/downloadSong`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId }),
      });
      if(!res.ok) {
        throw new Error('Failed to download song');
      }

      const data = await res.json();
      if(data.error) {
        throw new Error(data.error);
      }

      downloadSongModalOpen = false;
      songs.push(data.song);
    } catch(e) {
      console.error(e);
      if(e instanceof Error) {
        downloadError = e.message;
      }else {
        downloadError = e as string;
      }
    } finally {
      isDownloadingSong = false;
    }
  }
</script>

<Modal bind:open={downloadSongModalOpen}>
  <h1 class="text-lg font-medium">Download song</h1>
  <form onsubmit={(e) => (downloadSong(e))} method="post" class="flex flex-col gap-4 mt-4">
    <Input type="text" name="url" placeholder="Music URL" />
    {#if downloadError}
      <Alert>{downloadError}</Alert>
    {/if}
    <Button class="ml-auto" disabled={isDownloadingSong} loading={isDownloadingSong} type="submit">Download</Button>
  </form>
</Modal>


<div class="h-20 border-b border-border">
  <button onclick={() => (downloadSongModalOpen = true)}>Download</button>
</div>
