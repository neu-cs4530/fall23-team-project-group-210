import { Song } from '../../types/CoveyTownSocket';

/**
 * Basic generic Queue class. Need to update to allow queue order to be changed by votes.
 */
export default class SongQueue {
  private _storage: Song[] = [];

  constructor(songs: Song[]) {
    this._storage = songs;
  }

  get songs(): Song[] {
    return this._storage;
  }

  enqueue(song: Song): void {
    this._storage.push(song);
  }

  dequeue(): Song | undefined {
    return this._storage.shift();
  }

  sortByLikes(): void {
    this._storage.sort((a: Song, b: Song) => b.likes - a.likes);
  }

  size(): number {
    return this._storage.length;
  }

  updateSong(updatedSong: Song): void {
    const targetSong = this._storage.find(song => song.id === updatedSong.id);
    if (targetSong) {
      targetSong.likes = updatedSong.likes;
      targetSong.comments = updatedSong.comments;
    }
  }

  clearQueue(): void {
    this._storage = [];
  }
}
