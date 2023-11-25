import { Song } from './SpotifyAreaController';

/**
 * Basic generic Queue class. Need to update to allow queue order to be changed by votes.
 */
export class SongQueue {
  private _storage: Song[] = [];

  constructor() {
    this._storage = [];
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

  addLikeToSong(songId: string): void {
    const targetSong = this._storage.find(song => song.id === songId);
    if (targetSong) {
      targetSong.likes++;
    }
  }

  addDislikeToSong(songId: string): void {
    const targetSong = this._storage.find(song => song.id === songId);
    if (targetSong) {
      targetSong.dislikes++;
    }
  }

  removeLikeFromSong(songId: string): void {
    const targetSong = this._storage.find(song => song.id === songId);
    if (targetSong) {
      targetSong.likes--;
    }
  }

  addCommentToSong(songId: string, comment: string): void {
    const targetSong = this._storage.find(song => song.id === songId);
    if (targetSong) {
      targetSong.comments.push(comment);
    }
  }

  clearQueue(): void {
    this._storage = [];
  }
}
