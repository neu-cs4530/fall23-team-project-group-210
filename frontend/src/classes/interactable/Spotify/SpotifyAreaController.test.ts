import { getApp } from 'firebase/app';
import { SongQueue } from './Queue';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import SpotifyAreaController, { Song, SpotifyAreaModel } from './SpotifyAreaController';
// import { getDatabase, ref, set, onValue, Database } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { Database, getDatabase, onValue, ref, set } from 'firebase/database';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

describe('SpotifyAreaController and SongQueue Tests', () => {
  beforeEach(() => {
    // const model: SpotifyAreaModel = {
    //   queue: new SongQueue(),
    //   //NEED TO UPDATE interactableTypeForObjectType and create a type for spotifyArea
    //   type: 'ViewingArea',
    //   id: '',
    //   occupants: [],
    // };
    //const controller: SpotifyAreaController = new SpotifyAreaController(nanoid(), model);
  });
  describe('SongQueue', () => {
    it('SongQueue adds and removes songs in the right order', () => {
      const queue = new SongQueue();
      expect(queue.size()).toEqual(0);
      let song: Song = {
        name: 's1',
        likes: 0,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(1);
      song = {
        name: 's2',
        likes: 0,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(2);
      song = {
        name: 's3',
        likes: 0,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(3);
      expect(queue.dequeue()?.name).toEqual('s1');
      expect(queue.size()).toEqual(2);
      expect(queue.dequeue()?.name).toEqual('s2');
      expect(queue.size()).toEqual(1);
      expect(queue.dequeue()?.name).toEqual('s3');
      expect(queue.size()).toEqual(0);
    });
    it('SongQueue sorts songs by likes', () => {
      const queue = new SongQueue();
      let song: Song = {
        name: 's1',
        likes: 0,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      song = {
        name: 's2',
        likes: 3,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      song = {
        name: 's3',
        likes: 2,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      song = {
        name: 's4',
        likes: 1,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      song = {
        name: 's5',
        likes: 10,
        dislikes: 0,
        comments: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(5);
      queue.orderByLikes();
      expect(queue.dequeue()?.name).toEqual('s5');
      expect(queue.dequeue()?.name).toEqual('s2');
      expect(queue.dequeue()?.name).toEqual('s3');
      expect(queue.dequeue()?.name).toEqual('s4');
      expect(queue.dequeue()?.name).toEqual('s1');
    });
  });
  describe('Database', () => {
    let database: Database;
    let mockSpotifyAreaController: SpotifyAreaController;
    const userId = 1234;
    const model: SpotifyAreaModel = {
      queue: new SongQueue(),
      type: 'TicTacToeArea',
      id: '',
      occupants: [],
    };

    beforeEach(() => {
      // const app = initializeAdminApp({ projectId: projectId });
      database = getDatabase(app);
      mockSpotifyAreaController = new SpotifyAreaController('test', model);
    });
    // it('can read items from the database', async () => {
    //   const projectID = 'spotify-819f9';
    //   const db = firebase.initalizeTestApp({ projectId: projectID }).firestore();
    //   const testDoc = db.collection('readonly').doc('testDoc');
    //   await firebase.assertSucceeds(testDoc.get());
    // });

    it('can save song to the database', async () => {
      const song = {
        name: 'Hey',
        likes: 6,
        dislikes: 2,
        comments: ['math', 'blue'],
      };

      await mockSpotifyAreaController.saveSong(song, userId);

      const savedSongRef = ref(database, `player/${userId}/saved songs`);
      let savedSong;

      await onValue(savedSongRef, snapshot => {
        savedSong = snapshot.val();
      });

      expect(savedSong).toEqual(song);
      //expect(savedSong).toEqual(expect.arrayContaining([song]));
    });

    it('should retrieve saved songs from the database', async () => {
      const song: Song = {
        name: 'Test Song',
        likes: 5,
        dislikes: 2,
        comments: ['Great song!'],
      };

      await set(ref(database, `player/${userId}/saved songs`), [song]);

      const savedSongs = await mockSpotifyAreaController.getSavedSongs(userId);

      expect(savedSongs).toEqual(expect.arrayContaining([song]));
    });
    it('should handle the case when no songs are found', async () => {
      const userIdWithNoSongs = 7789;
      // await expect(mockSpotifyAreaController.getSavedSongs(userIdWithNoSongs)).rejects.toThrow(
      //   'No songs found for the player',
      // );
      await expect(mockSpotifyAreaController.getSavedSongs(userIdWithNoSongs)).resolves.toEqual([]);
    });
  });
});
