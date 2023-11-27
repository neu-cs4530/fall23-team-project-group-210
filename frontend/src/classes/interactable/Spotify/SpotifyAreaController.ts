import TownController from '../../TownController';
import {
  SpotifyApi,
  Device,
  PartialSearchResult,
  // SdkOptions,
  // AuthorizationCodeWithPKCEStrategy,
  // ItemTypes,
} from '@spotify/web-api-ts-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Song, SpotifyModel } from '../../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';
//import SongQueue from '../../../../../shared/types/SongQueue';

/**
 * Events to be emitted. I believe this tells the frontend to rerender. Right now
 * only adding a queueChanged event, but may need more types of events like new comments, likes,
 * song change, playback change, etc. Look at ViewingAreaController for examples.
 */
export type SpotifyAreaEvents = BaseInteractableEventMap & {
  queueChange: (newQueue: Song[]) => void;
};

/**
 * Responsible for managing the queue, likes, comments,
 * changing the queue based on the voting, and the sign in credentials
 */
//NEED TO UPDATE interactableTypeForObjectType and create a type for spotifyAreaModel
export default class SpotifyAreaController extends InteractableAreaController<
  SpotifyAreaEvents,
  SpotifyModel
> {
  private _spotifyAreaModel: SpotifyModel;

  private _spotifyAPI: SpotifyApi | undefined;

  private _device: Device | undefined;

  private _townController: TownController;

  /**
   * Create a new SpotifyAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, model: SpotifyModel, townController: TownController) {
    super(id);
    this._spotifyAreaModel = model;
    this._townController = townController;
    this._spotifyAPI = townController.spotifyDetails?.spotifyApi;
    this._device = townController.spotifyDetails?.device;
  }

  get queue(): Song[] {
    return this._spotifyAreaModel.queue;
  }

  public async addSongToQueue(song: Song): Promise<void> {
    const songToAdd: Song = {
      id: uuidv4(),
      albumUri: song.albumUri,
      uri: song.uri,
      name: song.name,
      artists: song.artists,
      likes: song.likes,
      dislikes: song.dislikes,
      comments: song.comments,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyAddSongCommand',
      song: songToAdd,
    });
  }

  public clearQueue(): void {
    // this._spotifyAreaModel.queue.clearQueue();
    // this.emit('queueUpdated');
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
    if (!this._spotifyAPI) {
      throw Error('Spotify details not provided');
    }
    if (searchString == '') {
      throw new Error('Search phrase cannot be empty');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line prettier/prettier
    const items: Required<Pick<PartialSearchResult, "tracks">> = await this._spotifyAPI.search(searchString, ['track'], undefined, 5);
    const songs: Song[] = items.tracks.items.map(item => ({
      id: uuidv4(),
      albumUri: item.album.uri,
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
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifySetCurrentSongCommand',
    });
    const current = this._spotifyAreaModel.currentlyPlaying;
    if (!current) {
      throw new Error('No songs in queue');
    }
    if (!this._device || !this._device.id) {
      throw new Error('Spotify device not provided or does not have an id');
    }
    if (!this._spotifyAPI) {
      throw new Error('Spotify api not provided');
    }
    this._spotifyAPI.player.startResumePlayback(this._device.id, current.albumUri, undefined, {
      uri: current.uri,
    });
    return current;
  }

  toInteractableAreaModel(): SpotifyModel {
    return this._spotifyAreaModel;
  }

  /**
   * Adds a like to the song with the provided id
   * @param songId id of the song to add like to
   */
  addLikeToSong(songId: string): void {
    // this._spotifyAreaModel.queue.addLikeToSong(songId);
    // this.emit('queueUpdated');
  }

  /**
   * Adds a dislike to the song with the provided id
   * @param songId id of the song to add dislike to
   */
  addDislikeToSong(songId: string): void {
    // this._spotifyAreaModel.queue.addDislikeToSong(songId);
    // this.emit('queueUpdated');
  }

  /**
   * Adds a like to the song with the provided id
   * @param songId id of the song to add like to
   */
  addCommentToSong(songId: string, comment: string): void {
    //this._spotifyAreaModel.queue.addCommentToSong(songId, comment);
    //await this._townController.sendInteractableCommand(this.id, )
  }

  //Need a method for passing song data to frontend/makeing stream connection. Waiting on API tool

  //Need method for handling sign in credentials. Waiting on API Tool

  /**
   * Emits a queueChanged event if anything about the queue has changed (likes, dislikes comments, order)
   * @param newModel The new model which is to be checked for changes with the current model
   */
  protected _updateFrom(newModel: SpotifyModel): void {
    this._spotifyAreaModel = newModel;
    this.emit('queueUpdated');
  }

  public isActive(): boolean {
    return this._spotifyAPI != undefined;
  }
}
