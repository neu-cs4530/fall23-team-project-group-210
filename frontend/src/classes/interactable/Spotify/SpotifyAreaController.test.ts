import { mock } from 'jest-mock-extended';
import type {
  Track,
  SimplifiedAlbum,
  ExternalIds,
  ExternalUrls,
  AudioFeatures,
  Market,
  AudioAnalysis,
} from '../../../../node_modules/@spotify/web-api-ts-sdk/dist/mjs/types';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import SpotifyAreaController from './SpotifyAreaController';
import { SpotifyApi, PartialSearchResult } from '@spotify/web-api-ts-sdk';
import TownController from '../../TownController';
import TracksEndpoints from '@spotify/web-api-ts-sdk/dist/mjs/endpoints/TracksEndpoints';
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
    uri: 'song_1_uri',
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
    uri: 'song_2_uri',
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
    uri: 'song_3_uri',
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
    danceability: 0,
    energy: 0,
    key: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 0,
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
    // Return a single AudioFeatures for a single ID
    return features;
  };

  // Assign the overloads to the mockSpotifyApi.tracks.audioFeatures
  mockSpotifyApi.tracks = {
    audioFeatures: audioFeaturesMock as unknown as {
      (id: string): Promise<AudioFeatures>;
      (ids: string[]): Promise<AudioFeatures[]>;
    },
  } as unknown as TracksEndpoints;
  // mockSpotifyApi.search.mockImplementation(
  //   async (s: string, t: readonly ItemTypes[], d?: Market, w?: number) => {
  //     return out;
  //   },
  // );
  // mockSpotifyApi.search.mockResolvedValue(() => {
  //   // Change the argument type or perform any custom logic
  //   // const modifiedId = id.toString();
  //   return out;
  // })
  // mockSpotifyApi.search.mockImplementation(
  //   async (_s: string, _t: readonly ItemTypes[], _d?: Market, _w?: number) => {
  //     return Promise.resolve(out);
  //   },
  // );
  const mockTownController = mock<TownController>();
  mockTownController.spotifyDetails = {
    spotifyApi: mockSpotifyApi,
    device: undefined,
  };
  //mockTownController.spotifyDetails = undefined;
  const controller: SpotifyAreaController = new SpotifyAreaController(
    '1',
    {
      id: '1',
      type: 'SpotifyArea',
      occupants: [],
      queue: [],
      currentlyPlaying: undefined,
      playSong: false,
    },
    mockTownController,
  );
  beforeEach(() => {});
  describe('SpotifyAreaController search', () => {
    it('Returns the correct search results with the proper data', async () => {
      const results = await controller.searchSong('song');
      const resultNames: string[] = results.map(song => song.name);
      const resultArtists: string[] = results.map(song => song.artists[0].name);
      const resultUri: string[] = results.map(song => song.uri);
      expect(resultNames).toEqual(['song_1', 'song_2', 'song_3']);
      expect(resultArtists).toEqual(['artist1', 'artist2', 'artist3']);
      expect(resultUri).toEqual(['song_1_uri', 'song_2_uri', 'song_3_uri']);
    });
  });
});

/**
 * spotify.search.mockImplementation(async (a: string, b: string[], c: SpotifyApi.Options, d: (error: any, response: SpotifyApi.Response) => void): Promise<SpotifyApi.Response> => {
   return Promise.resolve({
     tracks: {
       // ... provide the expected structure with types
     }
   } as SpotifyApi.Response);
});

spotify.search.mockImplementation(async (a, b, c, d) => {
   return Promise.resolve({
     tracks: {
       // ... provide the expected structure
     }
   });
});
 */
