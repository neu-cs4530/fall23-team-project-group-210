import {
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  InputGroup,
  List,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useSpotifyAreaController } from '../../../../classes/TownController';

import useTownController from '../../../../hooks/useTownController';
import { InteractableID, Song } from '../../../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';

type SongRating = -1 | 0 | 1;

type SongDictionary = Record<string, SongRating>;

function SpotifyHubArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useSpotifyAreaController(interactableID);
  const [queue, setQueue] = useState(spotifyAreaController.queue);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to store the search term
  const [searchResults, setSearchResults] = useState<Song[]>([]); // State to store the search results
  const [likeDict, setLikeDict] = useState<SongDictionary>({} as SongDictionary); // TODO: add this functionality

  const handleSearch: () => Promise<Error | undefined> = async (): Promise<Error | undefined> => {
    // Implement your Spotify search logic here. You may want to use the Spotify API or another service.
    // For simplicity, let's assume a function called searchSpotify in your spotifyAreaController.
    try {
      const results = await spotifyAreaController.searchSong(searchTerm);
      setSearchResults(results);
      return undefined;
    } catch (error) {
      return error as Error;
    }
  };

  useEffect(() => {
    const updateSpotifyState = () => {
      setQueue([...spotifyAreaController.queue]);

      const songLikeDict = spotifyAreaController.queue.reduce((acc, song) => {
        const oldLikeStatus = likeDict[song.id];
        if (oldLikeStatus !== undefined) {
          acc[song.id] = likeDict[song.id];
        } else {
          acc[song.id] = 0;
        }
        return acc;
      }, {} as Record<string, SongRating>);
      setLikeDict(songLikeDict);
    };

    const synchornizeQueues = () => {
      if (spotifyAreaController.queue.length !== 0) {
        console.log('We got to synchronization attempt.');
        spotifyAreaController.emit('queueUpdated');
      }
    };
    spotifyAreaController.addListener('queueUpdated', updateSpotifyState);
    spotifyAreaController.addListener('occupantsChange', synchornizeQueues);
    return () => {
      spotifyAreaController.removeListener('queueUpdated', updateSpotifyState);
      spotifyAreaController.removeListener('occupantsChange', synchornizeQueues);
    };
  }, [spotifyAreaController, likeDict, queue]);

  const toast = useToast();
  return (
    <Container>
      <Heading as='h2' size='md'>
        Search for a Song
      </Heading>
      <InputGroup>
        {/* Input field for searching */}
        <FormControl>
          <input
            type='text'
            placeholder='Enter song name...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </FormControl>
        {/* Button to trigger the search */}
        <Button
          onClick={async () => {
            const error: Error | undefined = await handleSearch();
            if (error) {
              toast({
                title: 'Error searching for song',
                description: error.message,
                status: 'error',
              });
            }
          }}>
          Search
        </Button>
      </InputGroup>

      {/* Display search results */}
      <List aria-label='list of search results'>
        {searchResults.map(result => (
          <Flex data-testid='search-result' key={result.id} align='center'>
            <Text>
              {result.name} - {result.artists[0].name}
            </Text>
            <Button
              onClick={() => {
                spotifyAreaController.addSongToQueue(result);
                // Add logic to add the selected song to the queue
                console.log('Song added to queue: ' + result.name);
              }}>
              Add to Queue
            </Button>
          </Flex>
        ))}
      </List>
      <Heading as='h2' size='md'>
        Spotify Song Queue
      </Heading>
      <Button
        onClick={() => {
          spotifyAreaController.clearQueue();
        }}>
        Clear Queue
      </Button>
      <Button
        onClick={async () => {
          try {
            await spotifyAreaController.playNextSong();
          } catch (e) {
            toast({
              title: 'Error playing song',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }}>
        Play Next
      </Button>
      <List aria-label='list of songs in the queue'>
        {queue.map(song => (
          <Flex data-testid='song' key={song.id} align='center'>
            <Text>
              {song.name} - {song.artists[0]?.name}
            </Text>
            {/* Add like/dislike buttons for each song in the queue, which would update the likes fields in each song */}
            {likeDict[song.id] < 1 ? (
              <Button
                onClick={() => {
                  console.log('song liked');
                  console.log(song.likes);
                  spotifyAreaController.addLikeToSong(song);
                  const songLikeDict = likeDict;
                  songLikeDict[song.id] += 1;
                  setLikeDict({ ...songLikeDict });
                }}>
                Like
              </Button>
            ) : null}

            {likeDict[song.id] > -1 ? (
              <Button
                onClick={() => {
                  console.log('song disliked');
                  spotifyAreaController.addDislikeToSong(song);
                  const songLikeDict = likeDict;
                  songLikeDict[song.id] -= 1;
                  setLikeDict({ ...songLikeDict });
                }}>
                Dislike
              </Button>
            ) : null}

            <Text>{song.likes}</Text>
          </Flex>
        ))}
      </List>
    </Container>
  );
}

/**
 * A wrapper component for the SpotifyArea component.
 * Determines if the player is currently in a spotify area on the map, and if so,
 * renders the SpotifyArea component in a modal.
 */
export default function SpotifyAreaWrapper(): JSX.Element {
  const townController = useTownController();
  const spotifyArea = useInteractable<SpotifyArea>('spotifyArea');

  useEffect(() => {
    if (spotifyArea) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [townController, spotifyArea]);

  const closeModal = useCallback(() => {
    if (spotifyArea) {
      townController.interactEnd(spotifyArea);
      // const controller = townController.getSpotifyAreaController(spotifyArea);
      townController.unPause();
    }
  }, [townController, spotifyArea]);

  if (spotifyArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spotify Area</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SpotifyHubArea interactableID={spotifyArea.name} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
