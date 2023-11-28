import TownController from '../../TownController';
import { SpotifyApi, Device, PartialSearchResult, AudioFeatures } from '@spotify/web-api-ts-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Song, SpotifyModel } from '../../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';

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
      comments: song.comments,
      albumImage: song.albumImage,
      songAnalytics: song.songAnalytics,
      genres: song.genres,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyAddSongCommand',
      song: songToAdd,
    });
  }

  public async _getSongAnalytics(uri: string): Promise<AudioFeatures | undefined> {
    const parts = uri.split(':');
    const id = parts[2];
    return this._spotifyAPI?.tracks.audioFeatures(id);
  }

  /**
   * Refresh the queue using the townService model
   */
  public async refreshQueue(): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyQueueRefreshCommand',
    });
  }

  public async clearQueue(): Promise<void> {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyClearQueueCommand',
    });
  }

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

  private _capitalizeEveryWord(inputString: string): string {
    return inputString.replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Return the search results of the provided song name
   * @param songName the name of the song provided by the frontend from the user
   */
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
    const songs: Promise<Song>[] = items.tracks.items.map(async item => ({
      id: uuidv4(),
      albumUri: item.album.uri,
      uri: item.uri,
      name: item.name,
      artists: item.artists,
      likes: 0,
      comments: [],
      genres: undefined,
      albumImage: item.album.images[0],
      songAnalytics: await this._getSongAnalytics(item.uri),
    }));
    const out: Song[] = await Promise.all(songs);
    out.forEach(async song => {
      const genres =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (await this._spotifyAPI?.search(song.artists[0].name, ['artist']))?.artists?.items[0]
          .genres ?? undefined;
      if (genres) {
        for (let i = 0; i < genres.length; i++) {
          genres[i] = this._capitalizeEveryWord(genres[i]);
        }
        song.genres = genres;
      }
    });
    return out;
  }

  /**
   * Plays the song at the top of the queue to the device. Removes that song from the queue, so this song
   * is returned by this function so its data can still be displayed.
   * @returns Promise of the song that is currently playing so its information can still be displayed
   */
  async playNextSong(): Promise<void> {
    if (this.queue.length === 0) {
      throw new Error('No songs in queue');
    }
    if (!this._device || !this._device.id) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'SpotifyPlaySongCommand',
      });
      throw new Error(
        'Spotify device not provided on sign in or does not have an id. Song will still play for other players',
      );
    }
    if (!this._spotifyAPI) {
      throw new Error('Spotify api not provided');
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyPlaySongCommand',
    });
  }

  private _playCurrentSong(): Song {
    const current = this._spotifyAreaModel.currentlyPlaying;
    if (!current) {
      throw new Error('Current song not set');
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
   * Adds a like to the song
   * @param songId song to add like to
   */
  async addLikeToSong(song: Song): Promise<void> {
    song.likes = song.likes + 1;
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  /**
   * Adds a dislike to the song
   * @param song song to add dislike to
   */
  async addDislikeToSong(song: Song): Promise<void> {
    song.likes = song.likes - 1;
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  /**
   * Adds a comment to the provided song
   * @param song song to add comment to
   * @param comment comment to add to song
   */
  async addCommentToSong(song: Song, comment: string): Promise<void> {
    song.comments.push(comment);
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  //Need a method for passing song data to frontend/makeing stream connection. Waiting on API tool

  //Need method for handling sign in credentials. Waiting on API Tool

  /**
   * Emits a queueChanged event if anything about the queue has changed (likes, comments, order)
   * @param newModel The new model which is to be checked for changes with the current model
   */
  protected _updateFrom(newModel: SpotifyModel): void {
    this._spotifyAreaModel = newModel;
    if (this._spotifyAreaModel.playSong) {
      try {
        this._playCurrentSong();
      } catch (e) {
        console.log('Error playing song on this device');
      }
      this._spotifyAreaModel.playSong = false;
    }
    this.emit('queueUpdated');
  }

  public isActive(): boolean {
    return this._spotifyAPI !== undefined && this.occupants.length > 0;
  }
}
