import SpotifyAreaController from '../../../../classes/interactable/Spotify/SpotifyAreaController';
import { nanoid } from 'nanoid';
import { mock, mockReset } from 'jest-mock-extended';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import SpotifyHubArea from './SpotifyHubArea';
import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { Song, SpotifyModel as SpotifyAreaModel } from '../../../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';
import { forEach } from 'lodash';

const MOCK_QUEUE: Song[] = [
  {
    id: '1',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 1',
    likes: 10,
    comments: ['Great song!', 'I love this one'],
    albumUri: '',
    artists: [],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: undefined,
  },
  {
    id: '2',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 2',
    likes: 5,
    comments: ['Not my favorite', 'Could be better'],
    albumUri: '',
    artists: [],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: undefined,
  },
  {
    id: '3',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 3',
    likes: 20,
    comments: ['This is amazing!', 'Best song ever'],
    albumUri: '',
    artists: [],
    albumImage: {
      url: '',
      height: 0,
      width: 0,
    },
    songAnalytics: undefined,
  },
];
class MockSpotifyAreaController extends SpotifyAreaController {
  public constructor() {
    super(nanoid(), mock<SpotifyAreaModel>(), mock<TownController>());
  }

  public async setUsername(): Promise<void> {
    this._userName = nanoid();
  }

  public async refreshSavedSongs(): Promise<void> {
    return;
  }

  // mock the functions that are called in the constructor
  get queue(): Song[] {
    return MOCK_QUEUE;
  }

  currentSong = jest.fn();

  addSongToQueue = jest.fn();

  removeFromSongQueue = jest.fn();

  likeSong = jest.fn();

  dislikeSong = jest.fn();
}

const mockSpotifyArea = mock<SpotifyArea>();

jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockSpotifyArea);
const useSpotifyAreaControllerSpy = jest.spyOn(TownControllerHooks, 'useSpotifyAreaController');

describe('SpotifyHubArea', () => {
  const townController = mock<TownController>();
  const spotifyAreaController = new MockSpotifyAreaController();

  function renderSpotifyHubArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <SpotifyHubArea />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    mockSpotifyArea.name = nanoid();
    mockReset(townController);
    useSpotifyAreaControllerSpy.mockReturnValue(spotifyAreaController);
  });

  describe('Rendering', () => {
    it('should render the SpotifyHubArea component', () => {
      const { getByText } = renderSpotifyHubArea();
      expect(getByText('Queue')).toBeInTheDocument();
    });
    it('should render the correct number of songs in queue', () => {
      const { getAllByTestId } = renderSpotifyHubArea();
      expect(getAllByTestId('queue-song').length).toBe(3);
    });
    it('should render the correct number of likes for each song in the queue', () => {
      const { getByText } = renderSpotifyHubArea();
      forEach(MOCK_QUEUE, song => {
        expect(getByText(song.likes.toString())).toBeInTheDocument();
      });
    });
  });
});
