import { SongQueue } from './Queue';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import { Song } from './SpotifyAreaController';
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
});
