import { Interactable } from '../../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';
import { SongQueue } from './Queue';

/**
 * Class to contain song data. Using a string for name until we decide on data implementation
 */
export type Song = {
  name: string;
  likes: number;
  dislikes: number;
  comments: string[];
};

/**
 * Events to be emitted. I believe this tells the fronted to rerender. Right now
 * only adding a queueChanged event, but may need more types of events like new comments, likes, 
 * song change, playback change, etc. Look at ViewingAreaController for examples.
 */
export type SpotifyAreaEvents = BaseInteractableEventMap & {
  queueChange: (newQueue: SongQueue) => void;
};

/**
 * Responsible for managing the queue, likes, comments,
 * changing the queue based on the voting, and the sign in credentials
 */
//NEED TO UPDATE interactableTypeForObjectType and create a type for spotifyAreaModel
export interface SpotifyAreaModel extends Interactable {
  queue: SongQueue;
}

export default class SpotifyAreaController extends InteractableAreaController<
  SpotifyAreaEvents,
  SpotifyAreaModel
> {
  private _spotifyAreaModel: SpotifyAreaModel;
  //private _spotifyInterface: APITool;

  /**
   * Create a new SpotifyAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, model: SpotifyAreaModel) {
    super(id);
    this._spotifyAreaModel = model;
  }

  get queue(): SongQueue {
    return this._spotifyAreaModel.queue;
  }

  public addToSongQueue(song: Song): void {
    this._spotifyAreaModel.queue.enqueue(song);
  }

  /**
   * Persistence? Is saving done when a button is pressed or automatically? When then?
   * - save song button that saves song and data for a user
   * - get saved songs
   *
   * Interactions between frontend and API:
   * - search songs by name of the song (then genre and artist) and return top three
   * - Get playback data or setup connection to frontend
   *
   * Other
   * - Add like/dislike/comment to song and update queue order
   */

  /**
   * Save the given song to the database for the given userId
   * @param song song to be saved
   * @param playerId playerId who saved the song
   */
  saveSong(song: Song, playerId: number): void {
    throw new Error('Method not implemented.');
  }

  /**
   * return the saved songs of the player with the provided id
   * @param playerId the Id of the player whose saved songs we're fetching
   */
  getSavedSongs(playerId: number): Song[] {
    throw new Error('Method not implemented.');
  }

  /**
   * Return the search results of the provided song name
   * @param songName the name of the song provided by the frontend from the user
   */
  searchSong(songName: string): Song[] {
    throw new Error('Method not implemented.');
  }

  toInteractableAreaModel(): SpotifyAreaModel {
    throw new Error('Method not implemented.');
  }

  /**
   * updates the song in the queue with the provided name to the given likes, dislikes, and comments
   * @param song name of song to update
   * @param likes number of likes for song
   * @param dislikes number of dislikes for song
   * @param comments comments for song
   */
  updateSong(song: string, likes: number, dislikes: number, comments: string[]): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Emits a queueChanged event if anything about the queue has changed (likes, dislikes comments, order)
   * @param newModel The new model which is to be checked for changes with the current model
   */
  protected _updateFrom(newModel: SpotifyAreaModel): void {
    throw new Error('Method not implemented.');
  }

  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }
}
