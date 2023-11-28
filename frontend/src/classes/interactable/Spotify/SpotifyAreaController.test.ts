import { mock } from 'jest-mock-extended';
import type {
  Track,
  SimplifiedAlbum,
  ExternalIds,
  ExternalUrls,
  AudioFeatures,
  AccessToken,
  SdkConfiguration,
} from '../../../../node_modules/@spotify/web-api-ts-sdk/dist/mjs/types';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import SpotifyAreaController from './SpotifyAreaController';
import { SpotifyApi, PartialSearchResult, IAuthStrategy } from '@spotify/web-api-ts-sdk';
import TownController from '../../TownController';
import TracksEndpoints from '@spotify/web-api-ts-sdk/dist/mjs/endpoints/TracksEndpoints';

import { getApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { Database, getDatabase, onValue, ref, set } from 'firebase/database';
import SongQueue from '../../../../../townService/src/town/Spotify/SongQueue';
import { Song } from '../../../types/CoveyTownSocket';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    features.id = id;
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

describe('Database', () => {
  let database: Database;
  let mockSpotifyAreaController: SpotifyAreaController;
  const userId = '1234';
  const mockTownController = mock<TownController>();
  const song1: Song = {
    id: 'someId',
    albumUri: 'someAlbumUri',
    uri: 'someUri',
    artists: [{ name: 'artist1', uri: 'artist1Uri' }],
    name: 'Test Song',
    likes: 5,
    comments: ['Great song!'],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: {
      danceability: 1,
      energy: 1,
      key: 1,
      loudness: 1,
      mode: 1,
      speechiness: 1,
      acousticness: 1,
      instrumentalness: 1,
      liveness: 1,
      valence: 1,
      tempo: 1,
      type: 'string',
      id: 'string',
      uri: 'string',
      track_href: 'string',
      analysis_url: 'string',
      duration_ms: 1,
      time_signature: 1,
    },
  };
  const song2: Song = {
    id: 'idisnew',
    albumUri: 'albumnnew',
    uri: 'newuri',
    artists: [{ name: 'artist341', uri: 'artist1Uri' }],
    name: 'Test Song',
    likes: 5,
    comments: ['Great song!'],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: {
      danceability: 1,
      energy: 1,
      key: 1,
      loudness: 1,
      mode: 1,
      speechiness: 1,
      acousticness: 1,
      instrumentalness: 1,
      liveness: 1,
      valence: 1,
      tempo: 1,
      type: 'c',
      id: 'd',
      uri: 's',
      track_href: 'd',
      analysis_url: 'a',
      duration_ms: 1,
      time_signature: 1,
    },
  };

  beforeEach(() => {
    // const app = initializeAdminApp({ projectId: projectId });
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    mockSpotifyAreaController = new SpotifyAreaController(
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
  });

  it('can save song to the database', async () => {
    mockSpotifyArea.saveSong(song2, userId);

    const savedSongRef = ref(database, `player/${userId}/saved songs`);
    let savedSong;
    console.log(mockSpotifyAreaController);
    onValue(savedSongRef, snapshot => {
      savedSong = snapshot.val();
    });
    expect(savedSong).toEqual(song1);

    // add song 2
    mockSpotifyAreaController.saveSong(song2, userId);
    await onValue(savedSongRef, snapshot => {
      savedSong = snapshot.val();
    });
    expect(savedSong).toEqual(expect.arrayContaining([song1, song2]));
    //expect(savedSong).toEqual(expect.arrayContaining([song]));
  });

  it('should retrieve saved songs from the database', async () => {
    mockSpotifyAreaController.saveSong(song1, userId);
    // await set(ref(database, `player/${userId}/saved songs`), [song1]);

    const savedSongs = mockSpotifyAreaController.getSavedSongs(userId);

    expect(savedSongs).toEqual(expect.arrayContaining([song1]));

    mockSpotifyAreaController.saveSong(song2, userId);
    const savedSongs2 = mockSpotifyAreaController.getSavedSongs(userId);
    expect(savedSongs2).toEqual(expect.arrayContaining([song1, song2]));
  });
  it('should handle the case when no songs are found', async () => {
    const userIdWithNoSongs = 7789;
    // await expect(mockSpotifyAreaController.getSavedSongs(userIdWithNoSongs)).rejects.toThrow(
    //   'No songs found for the player',
    // );
    await expect(mockSpotifyAreaController.getSavedSongs(userIdWithNoSongs)).resolves.toEqual([]);
  });
  it('removes a song from the players saved songs', async () => {
    const newuserId = 1888;
    // Add two songs to the database
    await mockSpotifyAreaController.saveSong(song1, newuserId);
    await mockSpotifyAreaController.saveSong(song2, newuserId);

    // Remove one song from the player's saved songs
    await mockSpotifyAreaController.removeSong(newuserId, song1);

    // Check if there is only one song left in the database
    const savedSongsRef = ref(database, `player/${newuserId}/saved songs`);
    let savedSongs;

    await onValue(savedSongsRef, snapshot => {
      savedSongs = snapshot.val();
    });

    expect(savedSongs).toEqual(song2);
  });
});
