import { Interactable } from '../../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
} from '../InteractableAreaController';
import { SongQueue } from './Queue';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, onValue, ref, set } from "firebase/database"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIE5wWApYIghDcv-GQJCtN3_CCJHzlGmg",
  authDomain: "spotify-819f9.firebaseapp.com",
  databaseURL: "https://spotify-819f9-default-rtdb.firebaseio.com",
  projectId: "spotify-819f9",
  storageBucket: "spotify-819f9.appspot.com",
  messagingSenderId: "643647635154",
  appId: "1:643647635154:web:c8b7f2a749b6d44054b70b",
  measurementId: "G-GXPWKR312B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/**
 * Class to contain song data. Using a string for name until we decide on data implementation
 */
export type Song = {
  name: string;
  likes: number;
  dislikes: number;
  comments: string[];
};

/**
 * Events to be emitted. I believe this tells the fronted to rerender. Right now
 * only adding a queueChanged event, but may need more types of events like new comments, likes,
 * song change, playback change, etc. Look at ViewingAreaController for examples.
 */
export type SpotifyAreaEvents = BaseInteractableEventMap & {
  queueChange: (newQueue: SongQueue) => void;
};

/**
 * Responsible for managing the queue, likes, comments,
 * changing the queue based on the voting, and the sign in credentials
 */
//NEED TO UPDATE interactableTypeForObjectType and create a type for spotifyAreaModel
export interface SpotifyAreaModel extends Interactable {
  queue: SongQueue;
}

export default class SpotifyAreaController extends InteractableAreaController<
  SpotifyAreaEvents,
  SpotifyAreaModel
> {
  private _spotifyAreaModel: SpotifyAreaModel;
  //private _spotifyInterface: APITool;

  /**
   * Create a new SpotifyAreaController
   * @param id
   * @param topic
   */
  constructor(id: string, model: SpotifyAreaModel) {
    super(id);
    this._spotifyAreaModel = model;
  }

  get queue(): SongQueue {
    return this._spotifyAreaModel.queue;
  }

  public addToSongQueue(song: Song): void {
    this._spotifyAreaModel.queue.enqueue(song);
  }

  /**
   * Persistence? Is saving done when a button is pressed or automatically? When then?
   * - save song button that saves song and data for a user
   * - get saved songs
   *
   * Interactions between frontend and API:
   * - search songs by name of the song (then genre and artist) and return top three
   * - Get playback data or setup connection to frontend
   *
   * Other
   * - Add like/dislike/comment to song and update queue order
   */

  /**
   * Save the given song to the database for the given userId
   * @param song song to be saved
   * @param playerId playerId who saved the song
   */
  saveSong(song: Song, playerId: number): void {
    const db = getDatabase(); 
    const reference = ref(db, "player/" + playerId); 

    set(reference, {
        username: playerId, 
        song: song, 
    }); 

  }

  /**
   * return the saved songs of the player with the provided id
   * @param playerId the Id of the player whose saved songs we're fetching
   */
  getSavedSongs(playerId: number): Song[] {
    const db = getDatabase(); 
    const songRef = ref(db, 'player/' + playerId + '/saved songs'); 
    onValue(songRef, (snapshot) => {
      snapshot.forEach(childSnapshot) => {
        const childKey = childSnapshot.key; 
        const childData = childSnapshot.val(); 
      }
   }), {
    onlyOnce: true 
   }
  }

  /**
   * Return the search results of the provided song name
   * @param songName the name of the song provided by the frontend from the user
   */
  searchSong(songName: string): Song[] {
    throw new Error('Method not implemented.' + songName);
  }

  toInteractableAreaModel(): SpotifyAreaModel {
    throw new Error('Method not implemented.');
  }

  /**
   * updates the song in the queue with the provided name to the given likes, dislikes, and comments
   * @param song name of song to update
   * @param likes number of likes for song
   * @param dislikes number of dislikes for song
   * @param comments comments for song
   */
  updateSong(song: string, likes: number, dislikes: number, comments: string[]): void {
    throw new Error('Method not implemented.' + song + likes + dislikes + comments);
  }

  //Need a method for passing song data to frontend/makeing stream connection. Waiting on API tool

  //Need method for handling sign in credentials. Waiting on API Tool

  /**
   * Emits a queueChanged event if anything about the queue has changed (likes, dislikes comments, order)
   * @param newModel The new model which is to be checked for changes with the current model
   */
  protected _updateFrom(newModel: SpotifyAreaModel): void {
    throw new Error('Method not implemented.' + newModel);
  }

  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }
}
