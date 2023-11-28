import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
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

export default class SpotifyArea extends InteractableArea {
  private _queue: SongQueue;

  private _currentSong: Song | undefined;

  private _playSong: boolean;

  public constructor(
    { id, queue }: Omit<SpotifyModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._queue = new SongQueue(queue);
    this._playSong = false;
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
    };
  }

  /**
   * Updates the state of this SpotifyArea, setting the queue, and currentSong properties
   *
   * @param viewingArea updated model
   */
  public updateModel(update: SpotifyModel) {
    this._queue = new SongQueue(update.queue);
    this._currentSong = update.currentlyPlaying;
    this._emitAreaChanged();
  }

  /**
   * Add song to the model's queue
   *
   * @param song new song to add
   */
  public addSong(song: Song) {
    this._queue.enqueue(song);
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
      },
      rect,
      townEmitter,
    );
  }
}
