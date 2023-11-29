import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import { getLastEmittedEvent } from '../../TestUtils';
import { TownEmitter } from '../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';

describe('SpotifyArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: SpotifyArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;
  const song = {
    name: 's1',
    likes: 0,
    comments: [],
    id: '1',
    uri: '',
    artists: [],
    albumUri: '',
    albumImage: { url: '', height: 0, width: 0 },
    songAnalytics: undefined,
  };
  const queue = [song];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new SpotifyArea(
      {
        queue: [],
        id,
        occupants: [],
        currentlyPlaying: undefined,
        playSong: false,
        savedSongs: {},
      },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        queue: [],
        id,
        currentlyPlaying: undefined,
        playSong: false,
        occupants: [newPlayer.id],
        savedSongs: {},
        type: 'SpotifyArea',
      });
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        queue: [],
        id,
        currentlyPlaying: undefined,
        playSong: false,
        occupants: [extraPlayer.id],
        savedSongs: {},
        type: 'SpotifyArea',
      });
    });
  });
  it("Clears the player's spotifyLabel and emits an update for their location", () => {
    testArea.remove(newPlayer);
    expect(newPlayer.location.interactableID).toBeUndefined();
    const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
    expect(lastEmittedMovement.location.interactableID).toBeUndefined();
  });
  it('Queue is preserved when the last occupant leaves and toModel only sets the specified properties', () => {
    testArea.addSong(song);
    testArea.remove(newPlayer);
    const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
    expect(lastEmittedUpdate).toEqual({
      queue,
      id,
      currentlyPlaying: undefined,
      playSong: false,
      occupants: [],
      savedSongs: {},
      type: 'SpotifyArea',
    });
    const testModel = testArea.toModel();
    expect(testModel).toEqual({
      id,
      occupants: [],
      type: 'SpotifyArea',
      queue,
      playSong: false,
      savedSongs: {},
      currentlyPlaying: undefined,
    });
  });

  describe('updateModel', () => {
    it('Updates the model only with the provided queue and currentlyPlaying', () => {
      testArea.updateModel({
        id,
        occupants: [],
        type: 'SpotifyArea',
        queue,
        savedSongs: {},
        currentlyPlaying: song,
        playSong: true,
      });
      const testModel = testArea.toModel();
      expect(testModel).toEqual({
        id,
        occupants: [newPlayer.id],
        type: 'SpotifyArea',
        queue,
        savedSongs: {},
        playSong: false,
        currentlyPlaying: song,
      });
    });

    it('Sends correct event to the client', () => {
      testArea.updateModel({
        id,
        occupants: [],
        type: 'SpotifyArea',
        savedSongs: {},
        queue: [],
        currentlyPlaying: undefined,
        playSong: true,
      });
      const testModel = testArea.toModel();
      expect(testModel).toEqual({
        id,
        occupants: [newPlayer.id],
        type: 'SpotifyArea',
        queue: [],
        playSong: false,
        savedSongs: {},
        currentlyPlaying: undefined,
      });

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual(testModel);
    });
  });

  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      const nameId = nanoid();
      expect(() =>
        SpotifyArea.fromMapObject({ id: 1, name: nameId, visible: true, x: 0, y: 0 }, townEmitter),
      ).toThrowError(`Malformed spotify area ${nameId}`);
    });
    it('Creates a new spotify area using the provided boundingBox and id, with an empty occupants list', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = SpotifyArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      const testModel = val.toModel();
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(testModel.queue).toEqual([]);
      expect(testModel.currentlyPlaying).toBeUndefined();
      expect(testModel.playSong).toEqual(false);
      expect(testModel.savedSongs).toEqual({});
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
