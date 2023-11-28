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

const MOCK_QUEUE: Song[] = [
  {
    id: '1',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 1',
    likes: 10,
    comments: ['Great song!', 'I love this one'],
    albumUri: '',
    artists: [],
  },
  {
    id: '2',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 2',
    likes: 5,
    comments: ['Not my favorite', 'Could be better'],
    albumUri: '',
    artists: [],
  },
  {
    id: '3',
    uri: 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6',
    name: 'Song 3',
    likes: 20,
    comments: ['This is amazing!', 'Best song ever'],
    albumUri: '',
    artists: [],
  },
];
class MockSpotifyAreaController extends SpotifyAreaController {
  public constructor() {
    super(nanoid(), mock<SpotifyAreaModel>(), mock<TownController>());
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
      expect(getByText('Spotify Song Queue')).toBeInTheDocument();
    });
  });

  describe('Song Details', () => {
    // it('should render the correct number of songs', () => {
    //   const { getAllByTestId } = renderSpotifyHubArea();
    //   expect(getAllByTestId('song').length).toBe(3);
    // });
    // it('should render the correct number of likes', () => {
    //   // const { getAllByTestId } = render(<SpotifyHubArea />);
    //   const { getAllByTestId } = renderSpotifyHubArea();
    //   expect(getAllByTestId('like').length).toBe(3);
    // });
    // it('should render the correct number of dislikes', () => {
    //   // const { getAllByTestId } = render(<SpotifyHubArea />);
    //   const { getAllByTestId } = renderSpotifyHubArea();
    //   expect(getAllByTestId('dislike').length).toBe(3);
    // });
    // it('should render the correct number of comments', () => {
    //   // const { getAllByTestId } = render(<SpotifyHubArea />);
    //   const { getAllByTestId } = renderSpotifyHubArea();
    //   expect(getAllByTestId('comment').length).toBe(6);
    // });
  });

  // TODO: implement buttons to SpotifyHubArea modal
  // describe('Action Buttons', () => {
  //   it('should render the correct number of add buttons', () => {
  //     // const { getAllByTestId } = render(<SpotifyHubArea />);
  //     const { getAllByTestId } = renderSpotifyHubArea();
  //     expect(getAllByTestId('add').length).toBe(3);
  //   });

  //   it('should render the correct number of remove buttons', () => {
  //     // const { getAllByTestId } = render(<SpotifyHubArea />);
  //     const { getAllByTestId } = renderSpotifyHubArea();
  //     expect(getAllByTestId('remove').length).toBe(3);
  //   });
  // });
});
