import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { FirebaseApp, initializeApp } from '@firebase/app';
import { getDatabase, onValue, ref, remove, set, update } from '@firebase/database';
import InvalidParametersError from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  SpotifyAddSongCommand,
  SpotifyModel,
  Song,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import SongQueue from './SongQueue';

const firebaseConfig = {
  apiKey: 'AIzaSyAIE5wWApYIghDcv-GQJCtN3_CCJHzlGmg',
  authDomain: 'spotify-819f9.firebaseapp.com',
  databaseURL: 'https://spotify-819f9-default-rtdb.firebaseio.com',
  projectId: 'spotify-819f9',
  storageBucket: 'spotify-819f9.appspot.com',
  messagingSenderId: '643647635154',
  appId: '1:643647635154:web:c8b7f2a749b6d44054b70b',
  measurementId: 'G-GXPWKR312B',
};
export default class SpotifyArea extends InteractableArea {
  private _queue: SongQueue;

  private _currentSong: Song | undefined;

  private _playSong: boolean;

  private _app: FirebaseApp;

  private _savedSongs: Record<string, Song[]> = {};

  public constructor(
    { id, queue }: Omit<SpotifyModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._queue = new SongQueue(queue);
    this._playSong = false;
    this._savedSongs = {};
    this._app = initializeApp(firebaseConfig);
  }

  /**
   * Convert this SpotifyArea instance to a simple SpotifyModel
   *
   * @returns SpotifyModel
   */
  public toModel(): SpotifyModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'SpotifyArea',
      queue: this._queue.songs,
      playSong: this._playSong,
      currentlyPlaying: this._currentSong,
      savedSongs: this._savedSongs,
    };
  }

  /**
   * Updates the state of this SpotifyArea, setting the queue, and currentSong properties
   *
   * @param viewingArea updated model
   */
  public updateModel(updateModel: SpotifyModel) {
    this._queue = new SongQueue(updateModel.queue);
    this._currentSong = updateModel.currentlyPlaying;
    this._savedSongs = updateModel.savedSongs;
    this._emitAreaChanged();
  }

  /**
   * Add song to the model's queue
   *
   * @param song new song to add
   */
  public addSong(song: Song) {
    this._queue.enqueue(song);
    this._queue.sortByLikes();
    this._emitAreaChanged();
  }

  /**
   * Play song that's next on the model's queue
   *
   */
  public playSong() {
    const current = this._queue.dequeue();
    this._currentSong = current;
    this._playSong = true;
    this._emitAreaChanged();
    this._playSong = false;
  }

  /**
   * Handle the various commands from the frontend
   *
   * @param command new command to the model
   * @param player player who sent the command
   * @returns empty InteractableCommandReturnType verification
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'SpotifyAddSongCommand') {
      const spotifyCommand = command as SpotifyAddSongCommand;
      this.addSong(spotifyCommand.song);
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyPlaySongCommand') {
      this.playSong();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyUpdateSongCommand') {
      this.updateSong(command.song);
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyQueueRefreshCommand') {
      this._emitAreaChanged();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyClearQueueCommand') {
      this._queue = new SongQueue([]);
      this._emitAreaChanged();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifySaveSongCommand') {
      this.songSave(command.song, command.userName);
      this._emitAreaChanged();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyGetSavedSongsCommand') {
      this._emitAreaChanged();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifyRemoveSongCommand') {
      this.songRemove(command.userName, command.song);
      this._emitAreaChanged();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError('Unknown command type');
  }

  /**
   * Update song on the model's queue
   *
   * @param song song to update
   */
  updateSong(song: Song) {
    this._queue.updateSong(song);
    this._queue.sortByLikes();
    this._emitAreaChanged();
  }

  /**
   * Creates a new SpotifyArea object that will represent a Spotify Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this spotify area exists
   * @param broadcastEmitter An emitter that can be used by this spotify area to broadcast updates
   * @returns new SpotifyArea object
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): SpotifyArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed spotify area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new SpotifyArea(
      {
        id: name as InteractableID,
        queue: [],
        currentlyPlaying: undefined,
        playSong: false,
        occupants: [],
        savedSongs: {},
      },
      rect,
      townEmitter,
    );
  }

  /**
   * Save the given song to the database for the given userId
   * @param song song to be saved
   * @param playerId playerId who saved the song
   */
  public songSave(song: Song, playerId: string): void {
    if (!this._savedSongs[playerId]) {
      this._savedSongs[playerId] = [];
    }
    if (!this._savedSongs[playerId].some(savedSong => savedSong.id === song.id)) {
      this._savedSongs[playerId].push(song);
      const db = getDatabase();
      const reference = ref(db, `player/${playerId}/saved songs`);

      // Check if song exists
      const unsubscribe = onValue(reference, snapshot => {
        if (snapshot.val()) {
          update(reference, {
            name: song.name,
            albumUri: song.albumUri,
            artists: song.artists,
            likes: song.likes,
            comments: song.comments,
            albumImage: song.albumImage,
            songAnalytics: song.songAnalytics,
          });
        } else {
          // Song doesn't exist, save it as a new song
          set(reference, song);
        }
      });
      unsubscribe();
    }
  }

  /**
   * Return a dictionary of saved songs for all user.
   * @param playerId The array of ids of the player whose saved songs we're fetching
   */
  public songsFromDatabase(playerIDS: string[]): void {
    const db = getDatabase(this._app);
    const savedSongDict = playerIDS.reduce((acc, player) => {
      const reference = ref(db, `player/${player}/savedSongs`);
      const savedSongs: Song[] = [];
      const unsubscribe = onValue(reference, snapshot => {
        if (snapshot.val()) {
          snapshot.forEach(childSnapshot => {
            const songData: Song = {
              name: childSnapshot.val().name,
              id: childSnapshot.val().id,
              albumUri: childSnapshot.val().albumUri,
              uri: childSnapshot.val().uri,
              artists: childSnapshot.val().artists,
              likes: childSnapshot.val().likes,
              comments: childSnapshot.val().comments,
              albumImage: childSnapshot.val().albumImage,
              songAnalytics: childSnapshot.val().songAnalytics,
            };
            savedSongs.push(songData);
          });
        }
        unsubscribe();
      });
      acc[player] = savedSongs;
      return acc;
    }, {} as Record<string, Song[]>);
    this._savedSongs = savedSongDict;
  }

  /**
   * Removes the song from the player's saved song list
   * @param playerId the Id of the player whose saved songs we're fetching
   * @param song The song that we are removing.
   */
  public songRemove(playerId: string, song: Song): void {
    this._savedSongs[playerId] = this._savedSongs[playerId].filter(
      (savedSong: Song) => savedSong.id !== song.id,
    );
    const db = getDatabase();
    const songRef = ref(db, `player/${playerId}/savedSongs/${song.id}`);

    // Remove the song from the player's saved songs
    remove(songRef);
  }
}
