import { mock } from 'jest-mock-extended';
import type {
  Track,
  SimplifiedAlbum,
  ExternalIds,
  ExternalUrls,
  AudioFeatures,
} from '../../../../node_modules/@spotify/web-api-ts-sdk/dist/mjs/types';
import SpotifyAreaController from './SpotifyAreaController';
import { SpotifyApi, PartialSearchResult } from '@spotify/web-api-ts-sdk';
import TownController from '../../TownController';
import TracksEndpoints from '@spotify/web-api-ts-sdk/dist/mjs/endpoints/TracksEndpoints';
import { Song } from '../../../types/CoveyTownSocket';
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
  const song1: Song = {
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
  mockTownController.spotifyDetails = {
    spotifyApi: mockSpotifyApi,
    device: undefined,
  };
  const controller: SpotifyAreaController = new SpotifyAreaController(
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
  const spyOnInteractableCommand: jest.SpyInstance = jest.spyOn(
    mockTownController,
    'sendInteractableCommand',
  );
  beforeEach(() => {
    spyOnInteractableCommand.mockClear();
  });
  describe('SpotifyAreaController tests', () => {
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
    });
    describe('Add song to queue', () => {
      it('Adding a song works properly', async () => {
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        controller.addSongToQueue(song1);
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
        controller.refreshQueue();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyQueueRefreshCommand',
        });
      });
    });

    describe('Clear Queue', () => {
      it('Clear Queue calls the right command', async () => {
        expect(spyOnInteractableCommand).toBeCalledTimes(0);
        controller.refreshQueue();
        expect(spyOnInteractableCommand).toBeCalledTimes(1);
        expect(spyOnInteractableCommand).toHaveBeenCalledWith('1', {
          type: 'SpotifyQueueRefreshCommand',
        });
      });
    });
  });
});
