import { mock } from 'jest-mock-extended';
import type {
  Track,
  SimplifiedAlbum,
  ExternalIds,
  ExternalUrls,
  // ItemTypes,
  // Market,
} from '../../../../node_modules/@spotify/web-api-ts-sdk/dist/mjs/types';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import SpotifyAreaController from './SpotifyAreaController';
import { SpotifyApi, PartialSearchResult } from '@spotify/web-api-ts-sdk';
import TownController from '../../TownController';
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
  track.name = 'song_2';
  track.album.name = 'album_2';
  track.uri = 'song_2_uri';
  track.artists[0].name = 'artist2';
  tracks.push(track);
  track.name = 'song_3';
  track.album.name = 'album_3';
  track.uri = 'song_3_uri';
  track.artists[0].name = 'artist3';
  tracks.push(track);
  out.tracks = {
    href: '1',
    items: tracks,
    limit: 3,
    next: null,
    offset: 1,
    previous: null,
    total: 5,
  };
  // mockSpotifyApi.search.mockImplementation(
  //   async (s: string, t: readonly ItemTypes[], d?: Market, w?: number) => out,
  // );
  const mockTownController = mock<TownController>();
  const controller: SpotifyAreaController = new SpotifyAreaController(
    '1',
    {
      id: '1',
      occupants: [],
      history: [],
      type: 'TicTacToeArea', //NEEDS TO BE UPDATED
      game: undefined,
    },
    mockTownController,
    mockSpotifyApi,
    '',
  );
  beforeEach(() => {});
  describe('SpotifyAreaController search', () => {
    it('Returns the correct search results', async () => {
      const result = await controller.searchSong('song');
      expect(result).toEqual([]);
    });
  });
});
