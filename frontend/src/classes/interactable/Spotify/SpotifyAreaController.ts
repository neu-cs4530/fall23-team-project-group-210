import TownController from '../../TownController';
import { SpotifyApi, Device, PartialSearchResult, AudioFeatures } from '@spotify/web-api-ts-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Comment, Song, SpotifyModel } from '../../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';
/**
 * Queue changed event so the frontend knows when to rerender
 */
export type SpotifyAreaEvents = BaseInteractableEventMap & {
  queueChange: (newQueue: Song[]) => void;
};

/**
 * Responsible for managing the queue, likes, comments,
 * changing the queue based on the voting, and the sign in credentials
 */
export default class SpotifyAreaController extends InteractableAreaController<
  SpotifyAreaEvents,
  SpotifyModel
> {
  private _spotifyAreaModel: SpotifyModel;

  private _spotifyAPI: SpotifyApi | undefined;

  private _device: Device | undefined;

  private _townController: TownController;

  protected _userName: string | undefined;

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

  /**
   * Gets the array of songs in the queue
   */
  get queue(): Song[] {
    return this._spotifyAreaModel.queue;
  }

  /**
   * Returns the saved songs for this user
   * @returns the list of saved songs
   */
  public async savedSongs(): Promise<Song[]> {
    if (!this._userName) {
      await this.setUsername();
    }

    if (this._userName) {
      const savedSongs = this._spotifyAreaModel.savedSongs[this._userName];
      return savedSongs;
    } else {
      return [];
    }
  }

  /**
   * Add provided song to queue
   * @param song song to add to queue
   */
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
      genre: song.genre,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyAddSongCommand',
      song: songToAdd,
    });
  }

  /**
   * Need to set the username field here, since it is an asych call to fetch it from the spotify api
   * @returns the song at the top of the queue
   */
  public async setUsername(): Promise<void> {
    const profile = await this._spotifyAPI?.currentUser.profile();
    const userName = profile?.display_name;
    if (!userName) {
      throw new Error('User not signed in');
    }
    this._userName = userName;
  }

  private async _getSongAnalytics(uri: string): Promise<AudioFeatures | undefined> {
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

  /**
   * Clears the current song queue
   */
  public async clearQueue(): Promise<void> {
    if (!this._spotifyAPI) {
      throw Error('Spotify details not provided on sign-in');
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyClearQueueCommand',
    });
  }

  /**
   * Saves the provided song to the database
   * @param song song to save
   */
  public async saveSong(song: Song): Promise<void> {
    if (!this._userName) {
      await this.setUsername();
    }
    if (this._userName) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'SpotifySaveSongCommand',
        song: song,
        userName: this._userName,
      });
    }
  }

  /**
   * Refereshes the saved songs so we have the most up to date saved songs
   */
  public async refreshSavedSongs(): Promise<void> {
    if (!this._userName) {
      await this.setUsername();
    }
    if (this._userName) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'SpotifyGetSavedSongsCommand',
        userName: this._userName,
      });
      const savedSongs = this._spotifyAreaModel.savedSongs[this._userName];
      console.log('saved songs: ' + savedSongs);
    }
  }

  /**
   * Removes a song from saved songs
   * @param song song to be removed from saved songs
   */
  public async removeSong(song: Song): Promise<void> {
    if (!this._userName) {
      await this.setUsername();
    }
    if (this._userName) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'SpotifyRemoveSongCommand',
        song: song,
        userName: this._userName,
      });
    }
  }

  /**
   * Capitalizes every word in the input string
   *
   * @param inputString the string to capitalize
   * @returns the capitalized string
   */
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
    // After spending time with the TAs trying to figure out the mock situation,
    // Udit said this was a fine solution for testing purpose
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
      genre: undefined,
      albumImage: item.album.images[0],
      songAnalytics: await this._getSongAnalytics(item.uri),
    }));
    const out: Song[] = await Promise.all(songs);
    this._addGenre(out);
    return out;
  }

  private _addGenre(songs: Song[]): void {
    songs.forEach(async song => {
      const genres =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (await this._spotifyAPI?.search(song.artists[0].name, ['artist']))?.artists?.items[0]
          .genres ?? undefined;
      if (genres && genres.length > 0) {
        genres[0] = this._capitalizeEveryWord(genres[0]);
        song.genre = genres[0];
      }
    });
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
    song.comments.push({
      id: uuidv4(),
      author: this._townController.userName,
      body: comment,
      likes: 0,
    });
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  /**
   * Adds a like to the comment
   * @param comment comment to add like to
   */
  async addLikeToComment(comment: Comment, song: Song): Promise<void> {
    comment.likes = comment.likes + 1;
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  /**
   * Adds a dislike to the comment
   * @param comment comment to add dislike to
   */
  async addDislikeToComment(comment: Comment, song: Song): Promise<void> {
    comment.likes = comment.likes - 1;
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SpotifyUpdateSongCommand',
      song: song,
    });
  }

  /**
   * Emits a queueChanged event if anything about the queue has changed (likes, comments, order)
   * @param newModel the model to replace this._spotifyAreaModel
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
    this.emit('savedSongsUpdated');
  }

  /**
   * Is this hub currently active based on the spotify data and the occupants
   * @returns if this spotify hub is currently active
   */
  public isActive(): boolean {
    return this._spotifyAPI !== undefined && this.occupants.length > 0;
  }
}
