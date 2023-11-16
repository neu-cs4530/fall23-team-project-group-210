import { SongQueue } from './SongQueue';
//import SpotifyAreaController, { SpotifyAreaModel } from './SpotifyAreaController';
import { Song } from './SpotifyAreaController';
describe('SongQueue Tests', () => {
  describe('SongQueue order', () => {
    it('SongQueue adds and removes songs in the right order', () => {
      const queue = new SongQueue();
      expect(queue.size()).toEqual(0);
      let song: Song = {
        name: 's1',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(1);
      song = {
        name: 's2',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(2);
      song = {
        name: 's3',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
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
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      song = {
        name: 's2',
        likes: 3,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      song = {
        name: 's3',
        likes: 2,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      song = {
        name: 's4',
        likes: 1,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      song = {
        name: 's5',
        likes: 10,
        dislikes: 0,
        comments: [],
        id: '',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(5);
      queue.sortByLikes();
      expect(queue.dequeue()?.name).toEqual('s5');
      expect(queue.dequeue()?.name).toEqual('s2');
      expect(queue.dequeue()?.name).toEqual('s3');
      expect(queue.dequeue()?.name).toEqual('s4');
      expect(queue.dequeue()?.name).toEqual('s1');
    });
  });

  describe('Updating queue', () => {
    let queue = new SongQueue();
    beforeEach(() => {
      queue = new SongQueue();
      let song: Song = {
        name: 's1',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '1',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(1);
      song = {
        name: 's2',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '2',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
      expect(queue.size()).toEqual(2);
      song = {
        name: 's3',
        likes: 0,
        dislikes: 0,
        comments: [],
        id: '3',
        uri: '',
        artists: [],
      };
      queue.enqueue(song);
    });
    it('Changing the number of likes is done correctly', () => {
      expect(queue.size()).toEqual(3);
      expect(queue.songs[0].likes).toEqual(0);
      expect(queue.songs[1].likes).toEqual(0);
      expect(queue.songs[2].likes).toEqual(0);
      queue.updateFieldsByID('2', 2);
      queue.updateFieldsByID('1', 4);
      queue.updateFieldsByID('3', 1);
      expect(queue.songs[0].likes).toEqual(4);
      expect(queue.songs[1].likes).toEqual(2);
      expect(queue.songs[2].likes).toEqual(1);
    });
    it('Changing the number of dislikes is done correctly', () => {
      expect(queue.size()).toEqual(3);
      expect(queue.songs[0].dislikes).toEqual(0);
      expect(queue.songs[1].dislikes).toEqual(0);
      expect(queue.songs[2].dislikes).toEqual(0);
      queue.updateFieldsByID('1', undefined, 4);
      queue.updateFieldsByID('2', undefined, 3);
      queue.updateFieldsByID('3', undefined, 2);
      expect(queue.songs[0].dislikes).toEqual(4);
      expect(queue.songs[1].dislikes).toEqual(3);
      expect(queue.songs[2].dislikes).toEqual(2);
    });

    it('Changing the number of comments is done correctly', () => {
      expect(queue.size()).toEqual(3);
      expect(queue.songs[0].comments).toEqual([]);
      expect(queue.songs[1].comments).toEqual([]);
      expect(queue.songs[2].comments).toEqual([]);
      queue.updateFieldsByID('1', undefined, undefined, ['1']);
      queue.updateFieldsByID('2', undefined, undefined, ['2']);
      queue.updateFieldsByID('3', undefined, undefined, ['3', '3']);
      expect(queue.songs[0].comments).toEqual(['1']);
      expect(queue.songs[1].comments).toEqual(['2']);
      expect(queue.songs[2].comments).toEqual(['3', '3']);
    });
  });
});
