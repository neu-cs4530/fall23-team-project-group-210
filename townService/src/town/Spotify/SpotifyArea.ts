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

  public constructor(
    { id, queue }: Omit<SpotifyModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._queue = new SongQueue(queue);
  }

  public toModel(): SpotifyModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'SpotifyArea',
      queue: this._queue.songs,
      currentlyPlaying: this._currentSong,
    };
  }

  /**
   * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel(update: SpotifyModel) {
    this._queue = new SongQueue(update.queue);
    this._currentSong = update.currentlyPlaying;
  }

  public addSong(song: Song) {
    this._queue.enqueue(song);
    this._emitAreaChanged();
  }

  public setCurrentSong() {
    const current = this._queue.dequeue();
    this._currentSong = current;
    this._emitAreaChanged();
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'SpotifyAddSongCommand') {
      const spotifyCommand = command as SpotifyAddSongCommand;
      this.addSong(spotifyCommand.song);
      return {} as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SpotifySetCurrentSongCommand') {
      this.setCurrentSong();
      return {} as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError('Unknown command type');
  }

  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): SpotifyArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed spotify area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new SpotifyArea(
      { id: name as InteractableID, queue: [], currentlyPlaying: undefined, occupants: [] },
      rect,
      townEmitter,
    );
  }
}
