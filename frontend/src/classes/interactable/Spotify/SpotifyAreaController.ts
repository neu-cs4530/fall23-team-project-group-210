import { GameArea, GameState, Interactable } from '../../../types/CoveyTownSocket';
import TownController from '../../TownController';
import GameAreaController, { GameEventTypes } from '../GameAreaController';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';
import { SongQueue } from './SongQueue';
import {
  SpotifyApi,
  SimplifiedArtist,
  SdkOptions,
  AuthorizationCodeWithPKCEStrategy,
  ItemTypes,
} from '@spotify/web-api-ts-sdk';
import { v4 as uuidv4 } from 'uuid';

/**
 * Class to contain song data. Using a string for name until we decide on data implementation
 */
export type Song = {
  id: string;
  uri: string;
  name: string;
  artists: SimplifiedArtist[];
  likes: number;
  dislikes: number;
  comments: string[];
};

/**
 * Events to be emitted. I believe this tells the fronted to rerender. Right now
 * only adding a queueChanged event, but may need more types of events like new comments, likes,
 * song change, playback change, etc. Look at ViewingAreaController for examples.
 */
export type SpotifyAreaEvents = GameEventTypes & {
  queueChange: (newQueue: SongQueue) => void;
};

// type PlayerCredentials = {
//   userIdToCredentials
// }

/**
 * Responsible for managing the queue, likes, comments,
 * changing the queue based on the voting, and the sign in credentials
 */
//NEED TO UPDATE interactableTypeForObjectType and create a type for spotifyAreaModel
export interface SpotifyAreaModel extends GameState {
  queue: SongQueue;
  //playerCredentials:
}

export default class SpotifyAreaController extends GameAreaController<
  SpotifyAreaModel,
  SpotifyAreaEvents
> {
  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }
  //private _spotifyAreaModel: SpotifyAreaModel;

  //NEED TO GET THESE TWO VALUES SOMEHOW
  private _spotifyAPI: SpotifyApi;

  private _deviceID: string;

  constructor(
    id: string,
    gameArea: GameArea<SpotifyAreaModel>,
    townController: TownController,
    spotifyAPI: SpotifyApi,
    deviceID: string,
  ) {
    super(id, gameArea, townController);
    this._spotifyAPI = spotifyAPI;
    this._deviceID = deviceID;
  }

  get queue(): SongQueue | undefined {
    return this._model.game?.state.queue;
  }

  public addToSongQueue(song: Song): void {
    this._model.game?.state.queue.enqueue(song);
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
    throw new Error('Method not implemented.' + song + playerId);
  }

  /**
   * return the saved songs of the player with the provided id
   * @param playerId the Id of the player whose saved songs we're fetching
   */
  getSavedSongs(playerId: number): Song[] {
    throw new Error('Method not implemented.' + playerId);
  }

  /**
   * Return the search results of the provided song name
   * @param songName the name of the song provided by the frontend from the user
   */
  //UPDATE TO BE ABLE TO SEARCH FOR ALBUMS AND ARTISTS AS WELL
  async searchSong(searchString: string): Promise<Song[]> {
    const items = await this._spotifyAPI.search(searchString, ['track'], undefined, 5);
    const songs: Song[] = items.tracks.items.map(item => ({
      id: uuidv4(),
      uri: item.uri,
      name: item.name,
      artists: item.artists,
      likes: 0,
      dislikes: 0,
      comments: [],
    }));
    return songs;
  }

  /**
   * Plays the song at the top of the queue to the device. Removes that song from the queue, so this song
   * is returned by this function so its data can still be displayed.
   * @returns Promise of the song that is currently playing so its information can still be displayed
   */
  async playNextSong(): Promise<Song> {
    const current: Song | undefined = this._model.game?.state.queue.dequeue();
    if (!current) {
      throw new Error('No songs in queue');
    }
    this._spotifyAPI.player.startResumePlayback(this._deviceID, current.uri);
    return current;
  }

  /**
   * updates the song in the queue with the provided name to the given likes, dislikes, and comments
   * @param song name of song to update
   * @param likes number of likes for song
   * @param dislikes number of dislikes for song
   * @param comments comments for song
   */
  updateSong(songId: string, likes?: number, dislikes?: number, comments?: string[]): void {
    this._model.game?.state.queue.updateFieldsByID(songId, likes, dislikes, comments);
    this._model.game?.state.queue.sortByLikes();
  }

  //Need a method for passing song data to frontend/makeing stream connection. Waiting on API tool

  //Need method for handling sign in credentials. Waiting on API Tool
}
