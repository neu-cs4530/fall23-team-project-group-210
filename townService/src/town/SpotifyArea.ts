import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  SpotifyArea as SpotifyAreaModel,
  SpotifyCommand,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class SpotifyArea extends InteractableArea {
  private _model: SpotifyAreaModel;

  public constructor(
    { id, queue }: Omit<SpotifyAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._model = { type: 'SpotifyArea', id: this.id, occupants: this.occupantsByID, queue };
  }

  public toModel(): SpotifyAreaModel {
    return this._model;
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'Spotify') {
      const spotifyCommand = command as SpotifyCommand;
      this._model = spotifyCommand.update;
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
      { id: name as InteractableID, queue: {}, occupants: [] },
      rect,
      townEmitter,
    );
  }
}
