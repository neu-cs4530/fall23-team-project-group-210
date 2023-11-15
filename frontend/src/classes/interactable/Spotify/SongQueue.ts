import { Song } from './SpotifyAreaController';

/**
 * Basic generic Queue class. Need to update to allow queue order to be changed by votes.
 */
export class SongQueue {
  private _storage: Song[] = [];

  queue(): Song[] {
    return this._storage;
  }

  enqueue(song: Song): void {
    this._storage.push(song);
  }

  dequeue(): Song | undefined {
    return this._storage.shift();
  }

  orderByLikes(): void {
    this._storage.sort((a: Song, b: Song) => b.likes - a.likes);
  }

  size(): number {
    return this._storage.length;
  }

  addLikeToSong(songName: string): void {
    const song = this._storage.find((song) => song.name === songName);
    if (song) {
      song.likes++;
    }
  }

  removeLikeFromSong(songName: string): void {
    const song = this._storage.find((song) => song.name === songName);
    if (song) {
      song.likes--;
    }
  }

  addCommentToSong(songName: string, comment: string): void {
    const song = this._storage.find((song) => song.name === songName);
    if (song) {
      song.comments.push(comment);
    }
  }

  
}
