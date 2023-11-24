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

  //CHANGE THESE TO IDs instead of names
  addLikeToSong(songName: string): void {
    const targetSong = this._storage.find(song => song.name === songName);
    if (targetSong) {
      targetSong.likes++;
    }
  }

  removeLikeFromSong(songName: string): void {
    const targetSong = this._storage.find(song => song.name === songName);
    if (targetSong) {
      targetSong.likes--;
    }
  }

  addCommentToSong(songName: string, comment: string): void {
    const targetSong = this._storage.find(song => song.name === songName);
    if (targetSong) {
      targetSong.comments.push(comment);
    }
  }

  clearQueue(): void {
    this._storage = [];
  }
}
