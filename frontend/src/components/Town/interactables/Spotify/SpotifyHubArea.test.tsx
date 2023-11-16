import SpotifyAreaController, { Song, SpotifyAreaModel } from "../../../../classes/interactable/Spotify/SpotifyAreaController";
import { nanoid } from "nanoid";
import { SongQueue } from "../../../../classes/interactable/Spotify/Queue";
import { InteractableType } from "../../../../types/CoveyTownSocket";
import { mock, mockReset } from "jest-mock-extended";
import SpotifyArea from "./SpotifyArea";
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import SpotifyHubArea from "./SpotifyHubArea";
import React from "react";
import { getByText, render } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import TownControllerContext from "../../../../contexts/TownControllerContext";

const mockQueue = [
  {
    "name": "Song 1",
    "likes": 10,
    "dislikes": 2,
    "comments": [
      "Great song!",
      "I love this one"
    ]
  },
  {
    "name": "Song 2",
    "likes": 5,
    "dislikes": 1,
    "comments": [
      "Not my favorite",
      "Could be better"
    ]
  },
  {
    "name": "Song 3",
    "likes": 20,
    "dislikes": 0,
    "comments": [
      "This is amazing!",
      "Best song ever"
    ]
  }
]
class MockSpotifyAreaController extends SpotifyAreaController {
  public constructor() {
    super(nanoid(), mock<SpotifyAreaModel>(), mock<TownController>());
  }

  // mock the functions that are called in the constructor
  get queue(): SongQueue {
    let queue = new SongQueue();
    mockQueue.forEach(song => {
      queue.enqueue({
        name: song.name, 
        likes: song.likes, 
        dislikes: song.dislikes, 
        comments: song.comments
      });
    });
    return queue;
  }

  currentSong = jest.fn();

  addToSongQueue = jest.fn();

  removeFromSongQueue = jest.fn();

  likeSong = jest.fn();

  dislikeSong = jest.fn();
} 

const mockSpotifyArea = mock<SpotifyArea>();
mockSpotifyArea.getData.mockReturnValue('Spotify');

jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockSpotifyArea);
const useInteractableAreaControllerSpy = jest.spyOn(TownControllerHooks, 'useInteractableAreaController');

describe('SpotifyHubArea', () => {
  let mockSpotifyAreaController: MockSpotifyAreaController;

  beforeAll(() => {
    mockSpotifyAreaController = new MockSpotifyAreaController();
  });

  beforeEach(() => {
    useInteractableAreaControllerSpy.mockReturnValue(mockSpotifyAreaController);
  });

  const townController = mock<TownController>();
  let spotifyAreaController = new MockSpotifyAreaController();

  function renderSpotifyHubArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <SpotifyHubArea />
        </TownControllerContext.Provider>
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    mockSpotifyArea.name = nanoid();
    mockReset(townController);
    // spotifyAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(spotifyAreaController);

    // ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    // mockGameArea.name = nanoid();
    // mockReset(townController);
    // gameAreaController.mockReset();
    // useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    // leaderboardComponentSpy.mockClear();
    // mockToast.mockClear();
    // gameAreaController.joinGame.mockReset();
    // gameAreaController.makeMove.mockReset();

    // gameAreaController.joinGame.mockImplementation(
    //   () =>
    //     new Promise<void>((resolve, reject) => {
    //       joinGameResolve = resolve;
    //       joinGameReject = reject;
    //     }),
    // );
  });

  describe('Rendering', () => {
    it('should render the SpotifyHubArea component', () => {
      const { getByText } = renderSpotifyHubArea();
      expect(getByText('Spotify Song Queue')).toBeInTheDocument();
    });
  });

  describe('Song Details', () => {
    it('should render the correct number of songs', () => {
      // const { getAllByTestId } = render(<SpotifyHubArea />);
      const { getAllByTestId } = renderSpotifyHubArea();
      expect(getAllByTestId('song').length).toBe(3);
    });

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