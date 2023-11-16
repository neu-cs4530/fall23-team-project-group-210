import { Song } from './SpotifyAreaController';

/**
 * Basic generic Queue class. Need to update to allow queue order to be changed by votes.
 */
export class SongQueue {
  private _storage: Song[] = [];

  public get songs(): Song[] {
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

  updateFieldsByID(songId: string, likes?: number, dislikes?: number, comments?: string[]): void {
    const song: Song | undefined = this._storage.find(s => s.id === songId);
    if (song) {
      if (likes) {
        song.likes = likes;
      }
      if (dislikes) {
        song.dislikes = dislikes;
      }
      if (comments) {
        song.comments = comments;
      }
    }
  }
}
