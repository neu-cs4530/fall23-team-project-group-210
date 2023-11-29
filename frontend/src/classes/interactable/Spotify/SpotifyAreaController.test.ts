import { mock } from 'jest-mock-extended';
import type {
  Track,
  SimplifiedAlbum,
  ExternalIds,
  ExternalUrls,
  AudioFeatures,
  UserProfile,
  Device,
} from '../../../../node_modules/@spotify/web-api-ts-sdk/dist/mjs/types';
import SpotifyAreaController from './SpotifyAreaController';
import { SpotifyApi, PartialSearchResult } from '@spotify/web-api-ts-sdk';
import TownController from '../../TownController';
import TracksEndpoints from '@spotify/web-api-ts-sdk/dist/mjs/endpoints/TracksEndpoints';
import { Song, SpotifyModel } from '../../../types/CoveyTownSocket';
import CurrentUserEndpoints from '@spotify/web-api-ts-sdk/dist/mjs/endpoints/CurrentUserEndpoints';
import PlayerController from '../../PlayerController';
describe('SpotifyAreaController Tests', () => {
  const mockSpotifyApi = mock<SpotifyApi>();
  const out: Pick<PartialSearchResult, 'tracks'> = {};
  const tracks: Track[] = [];
  const externalIds: ExternalIds = {
    upc: '',
    isrc: '',
    ean: '',
  };
  const externalUrls: ExternalUrls = { spotify: '' };
  const album: SimplifiedAlbum = {
    album_group: '',
    artists: [],
    album_type: '',
    available_markets: [],
    copyrights: [],
    external_ids: externalIds,
    external_urls: externalUrls,
    genres: [],
    href: '',
    id: '',
    images: [],
    label: '',
    name: 'album_1',
    popularity: 0,
    release_date: '',
    release_date_precision: '',
    total_tracks: 0,
    type: '',
    uri: '',
  };
  let song1: Song = {
    id: 'mocked-uuid',
    albumUri: '',
    uri: '',
    name: 'song_1',
    artists: [],
    likes: 0,
    comments: [],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: undefined,
    genre: undefined,
  };
  const track: Track = {
    album: album,
    external_ids: externalIds,
    popularity: 0,
    artists: [
      { external_urls: externalUrls, href: '', id: '', name: 'artist1', type: '', uri: '' },
    ],
    available_markets: [],
    disc_number: 0,
    duration_ms: 0,
    episode: false,
    explicit: false,
    external_urls: externalUrls,
    href: '',
    id: '',
    is_local: false,
    name: 'song_1',
    preview_url: null,
    track: false,
    track_number: 0,
    type: '',
    uri: 'x:x:song_1_uri',
  };
  tracks.push(track);
  const track2: Track = {
    album: album,
    external_ids: externalIds,
    popularity: 0,
    artists: [
      { external_urls: externalUrls, href: '', id: '', name: 'artist2', type: '', uri: '' },
    ],
    available_markets: [],
    disc_number: 0,
    duration_ms: 0,
    episode: false,
    explicit: false,
    external_urls: externalUrls,
    href: '',
    id: '',
    is_local: false,
    name: 'song_2',
    preview_url: null,
    track: false,
    track_number: 0,
    type: '',
    uri: 'x:x:song_2_uri',
  };
  tracks.push(track2);
  const track3: Track = {
    album: album,
    external_ids: externalIds,
    popularity: 0,
    artists: [
      { external_urls: externalUrls, href: '', id: '', name: 'artist3', type: '', uri: '' },
    ],
    available_markets: [],
    disc_number: 0,
    duration_ms: 0,
    episode: false,
    explicit: false,
    external_urls: externalUrls,
    href: '',
    id: '',
    is_local: false,
    name: 'song_3',
    preview_url: null,
    track: false,
    track_number: 0,
    type: '',
    uri: 'x:x:song_3_uri',
  };
  out.tracks = {
    href: '1',
    items: tracks,
    limit: 3,
    next: null,
    offset: 1,
    previous: null,
    total: 5,
  };
  tracks.push(track3);
  mockSpotifyApi.search.mockResolvedValue(out);
  const features: AudioFeatures = {
    danceability: 10,
    energy: 3,
    key: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 9,
    instrumentalness: 0,
    liveness: 0,
    valence: 0,
    tempo: 0,
    type: '',
    id: '',
    uri: '',
    track_href: '',
    analysis_url: '',
    duration_ms: 0,
    time_signature: 0,
  };
  const features2: AudioFeatures = {
    danceability: 4,
    energy: 1,
    key: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 1,
    instrumentalness: 0,
    liveness: 0,
    valence: 0,
    tempo: 0,
    type: '',
    id: '',
    uri: '',
    track_href: '',
    analysis_url: '',
    duration_ms: 0,
    time_signature: 0,
  };
  const audioFeaturesMock = async (id: string): Promise<AudioFeatures> => {
    console.log(id);
    if (id === 'song_2_uri') {
      return features2;
    }
    return features;
  };
  // Assign the overloads to the mockSpotifyApi.tracks.audioFeatures
  mockSpotifyApi.tracks = {
    audioFeatures: audioFeaturesMock as unknown as {
      (id: string): Promise<AudioFeatures>;
      (ids: string[]): Promise<AudioFeatures[]>;
    },
  } as unknown as TracksEndpoints;
  const mockTownController = mock<TownController>();
  let controller: SpotifyAreaController;
  const spyOnInteractableCommand: jest.SpyInstance = jest.spyOn(
    mockTownController,
    'sendInteractableCommand',
  );
  beforeEach(() => {
    spyOnInteractableCommand.mockClear();
    mockTownController.spotifyDetails = {
      spotifyApi: mockSpotifyApi,
      device: undefined,
    };
    controller = new SpotifyAreaController(
      '1',
      {
        id: '1',
        type: 'SpotifyArea',
        occupants: [],
        queue: [],
        currentlyPlaying: undefined,
        playSong: false,
        savedSongs: {},
      },
      mockTownController,
    );
    song1 = {
      id: 'mocked-uuid',
      albumUri: '',
      uri: '',
      name: 'song_1',
      artists: [],
      likes: 0,
      comments: [],
      albumImage: {
        url: '',
        height: 0,
        width: 0,
      },
      songAnalytics: undefined,
      genre: undefined,
    };
  });
  describe('SpotifyAreaController tests', () => {
    describe('Add song to queue', () => {
      it('Adding a song works properly', async () => {
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.addSongToQueue(song1);
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyAddSongCommand',
          song: expect.objectContaining({ name: 'song_1' }),
        });
      });
    });

    describe('Refresh Queue', () => {
      it('Refresh Queue calls the right command', async () => {
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.refreshQueue();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyQueueRefreshCommand',
        });
      });
    });

    describe('Clear Queue', () => {
      it('Clear Queue calls the right command', async () => {
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.refreshQueue();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyQueueRefreshCommand',
        });
      });
    });

    describe('Save Song', () => {
      it('Save song calls the right command', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: 'mockDisplayName' } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.saveSong(song1);
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifySaveSongCommand',
          song: expect.objectContaining({ name: 'song_1' }),
          userName: 'mockDisplayName',
        });
      });

      it('Save song throws error if username cannot be retrieved', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: undefined } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        await expect(controller.saveSong(song1)).rejects.toThrow('User not signed in');
      });
    });

    describe('Get save Song', () => {
      it('Get save song calls the right command', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: 'mockDisplayName' } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.getSavedSong();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyGetSavedSongsCommand',
          userName: 'mockDisplayName',
        });
      });

      it('Get save song throws error if username cannot be retrieved', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: undefined } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        await expect(controller.getSavedSong()).rejects.toThrow('User not signed in');
      });
    });

    describe('Remove saved song', () => {
      it('Remove song calls the right command', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: 'mockDisplayName' } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await controller.removeSong(song1);
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyRemoveSongCommand',
          song: expect.objectContaining({ name: 'song_1' }),
          userName: 'mockDisplayName',
        });
      });

      it('Get save song throws error if username cannot be retrieved', async () => {
        const profileMock = async (): Promise<UserProfile> => {
          return { display_name: undefined } as unknown as UserProfile;
        };
        mockSpotifyApi.currentUser = { profile: profileMock } as unknown as CurrentUserEndpoints;
        await expect(controller.removeSong(song1)).rejects.toThrow('User not signed in');
      });
    });
    describe('SpotifyAreaController search', () => {
      it('Returns the correct search results with the proper data', async () => {
        const results = await controller.searchSong('song');
        const resultNames: string[] = results.map(song => song.name);
        const resultArtists: string[] = results.map(song => song.artists[0].name);
        const resultUri: string[] = results.map(song => song.uri);
        const resultDanceability: (number | undefined)[] = results.map(
          song => song.songAnalytics?.danceability,
        );
        const resultEnergy: (number | undefined)[] = results.map(
          song => song.songAnalytics?.energy,
        );
        const resultAcousticness: (number | undefined)[] = results.map(
          song => song.songAnalytics?.acousticness,
        );
        expect(resultNames).toEqual(['song_1', 'song_2', 'song_3']);
        expect(resultArtists).toEqual(['artist1', 'artist2', 'artist3']);
        expect(resultUri).toEqual(['x:x:song_1_uri', 'x:x:song_2_uri', 'x:x:song_3_uri']);
        expect(resultDanceability).toEqual([10, 4, 10]);
        expect(resultEnergy).toEqual([3, 1, 3]);
        expect(resultAcousticness).toEqual([9, 1, 9]);
      });

      it('Throws errors when api is undefined', async () => {
        mockTownController.spotifyDetails = undefined;
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        await expect(controller.searchSong('jk')).rejects.toThrow('Spotify details not provided');
      });
      it('Throws errors when search string is empty', async () => {
        await expect(controller.searchSong('')).rejects.toThrow('Search phrase cannot be empty');
      });
    });
    describe('Play next song', () => {
      it('Throws errors when no songs are in queue', async () => {
        await expect(controller.playNextSong()).rejects.toThrow('No songs in queue');
      });
      it('Throws errors when there is no spotify api', async () => {
        mockTownController.spotifyDetails = undefined;
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [song1],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        await expect(controller.playNextSong()).rejects.toThrow(
          'Spotify device not provided on sign in or does not have an id. Song will still play for other players',
        );
      });
      it('Throws errors when there is no spotify device but still sends command', async () => {
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [song1],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        await expect(controller.playNextSong()).rejects.toThrow(
          'Spotify device not provided on sign in or does not have an id. Song will still play for other players',
        );
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyPlaySongCommand',
        });
      });

      it('Interactable command is sent', async () => {
        mockTownController.spotifyDetails = {
          device: { id: '1' } as unknown as Device,
          spotifyApi: mockSpotifyApi,
        };
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [song1],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        controller.playNextSong();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyPlaySongCommand',
        });
      });
    });
    describe('To interactable model', () => {
      it('Returns the model properly', async () => {
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [song1],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        expect(controller.toInteractableAreaModel()).toStrictEqual({
          currentlyPlaying: undefined,
          queue: [song1],
          occupants: [],
          id: '1',
          playSong: false,
          savedSongs: {},
          type: 'SpotifyArea',
        });
      });
    });

    describe('Change songs', () => {
      it('Add like to song', async () => {
        const likes = song1.likes;
        controller.addLikeToSong(song1);
        expect(song1.likes).toBe(likes + 1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyUpdateSongCommand',
          song: song1,
        });
      });
      it('Add dislike to song', async () => {
        const likes = song1.likes;
        controller.addDislikeToSong(song1);
        expect(song1.likes).toBe(likes - 1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyUpdateSongCommand',
          song: song1,
        });
      });
      it('Add comment to song', async () => {
        const commentsSize = song1.comments.length;
        controller.addCommentToSong(song1, 'comment');
        expect(song1.comments.length).toBe(commentsSize + 1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyUpdateSongCommand',
          song: song1,
        });
      });
    });
    describe('Is Active?', () => {
      it('Active situations', () => {
        expect(controller.isActive()).toBe(false);
        controller.occupants = [{} as unknown as PlayerController];
        expect(controller.isActive()).toBe(true);
        mockTownController.spotifyDetails = undefined;
        controller = new SpotifyAreaController(
          '1',
          {
            id: '1',
            type: 'SpotifyArea',
            occupants: [],
            queue: [song1],
            currentlyPlaying: undefined,
            playSong: false,
            savedSongs: {},
          },
          mockTownController,
        );
        expect(controller.isActive()).toBe(false);
      });
    });
  });
});
