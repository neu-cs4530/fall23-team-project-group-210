import { mock } from "jest-mock-extended";
import SpotifyAreaController from "../../../../classes/interactable/Spotify/SpotifyAreaController";
import Interactable from "../../Interactable";


const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

class MockSpotifyAreaController extends SpotifyAreaController {
  
}