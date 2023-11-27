import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  SongQueue,
  SpotifyArea as SpotifyAreaModel,
  SpotifyCommand,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class SpotifyArea extends InteractableArea {
  private _queue: SongQueue;

  private _isPlaying: boolean;

  public constructor(
    { id, queue }: Omit<SpotifyAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._queue = queue;
    this._isPlaying = false;
  }

  public toModel(): SpotifyAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'SpotifyArea',
      queue: this._queue,
      isPlaying: this._isPlaying,
    };
  }

  /**
   * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel(update: SpotifyAreaModel) {
    this._queue = update.queue;
    this._isPlaying = update.isPlaying;
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'SpotifyAreaUpdate') {
      const spotifyCommand = command as SpotifyCommand;
      this.updateModel(spotifyCommand.update);
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
      { id: name as InteractableID, queue: new SongQueue(), isPlaying: false, occupants: [] },
      rect,
      townEmitter,
    );
  }
}
