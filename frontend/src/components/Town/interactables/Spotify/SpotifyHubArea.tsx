import {
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  Grid,
  Heading,
  Icon,
  Image,
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
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from 'react-icons/ai';

type SongRating = -1 | 0 | 1;

type SongDictionary = Record<string, SongRating>;

function SpotifyHubArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useSpotifyAreaController(interactableID);
  const townController = useTownController();
  const [queue, setQueue] = useState(spotifyAreaController.queue);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to store the search term
  const [searchResults, setSearchResults] = useState<Song[]>([]); // State to store the search results
  const [likeDict, setLikeDict] = useState<SongDictionary>(
    spotifyAreaController.queue.reduce((acc, song) => {
      acc[song.id] = 0;
      return acc;
    }, {} as Record<string, SongRating>),
  ); // State to store the user's like/dislike status of each song

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
      console.log('Updated likeDict: ', songLikeDict);
    };

    const synchronizeQueues = () => {
      if (spotifyAreaController.queue.length !== 0) {
        console.log('Rendering queue for new player.');
        spotifyAreaController.refreshQueue();
      }
    };
    spotifyAreaController.addListener('queueUpdated', updateSpotifyState);
    townController.addListener('playersChanged', synchronizeQueues);
    return () => {
      spotifyAreaController.removeListener('queueUpdated', updateSpotifyState);
      townController.removeListener('playersChanged', synchronizeQueues);
    };
  }, [spotifyAreaController, likeDict, queue, townController]);

  const toast = useToast();
  return (
    <Container>
      <Heading as='h2' size='md'>
        Song Search
      </Heading>
      {/* add small gap of 10 px */}
      <Divider style={{ width: '20px' }} />
      <InputGroup>
        {/* Input field for searching */}
        <FormControl color='black'>
          <input
            type='text'
            style={{ width: '400px' }}
            placeholder='What do you want to listen to?'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </FormControl>
        {/* Button to trigger the search */}
        <Button
          bg='gray.800'
          variant='outline'
          colorScheme='white'
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
          <Flex
            data-testid='search-result'
            key={result.id}
            align='center'
            justifyContent='space-between'
            mb={2}>
            <Text>
              {result.name} - {result.artists[0].name}
            </Text>
            <Button
              bg='gray.800'
              variant='outline'
              colorScheme='white'
              onClick={() => {
                spotifyAreaController.addSongToQueue(result);
                console.log('Song added to queue: ' + result.name);
              }}>
              Add to Queue
            </Button>
          </Flex>
        ))}
      </List>
      <Heading as='h2' size='md'>
        Queue
      </Heading>
      <Button
        bg='gray.800'
        variant='outline'
        colorScheme='white'
        onClick={() => {
          spotifyAreaController.clearQueue();
        }}>
        Clear Queue
      </Button>
      <Button
        bg='gray.800'
        variant='outline'
        colorScheme='white'
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
          <Grid
            key={song.id}
            templateColumns='450px 60px 20px 30px'
            gap={1}
            justifyItems='left'
            alignItems='center'>
            {/* Text */}
            <Text>
              {song.name} - {song.artists[0]?.name}
            </Text>

            {/* Like Button */}
            <Button
              variant={likeDict[song.id] === 1 ? 'solid' : 'outline'}
              colorScheme='green'
              isActive={likeDict[song.id] === 1}
              onClick={() => {
                const songLikeDict = likeDict;
                if (likeDict[song.id] === 0) {
                  spotifyAreaController.addLikeToSong(song);
                  songLikeDict[song.id] = 1;
                } else if (likeDict[song.id] === -1) {
                  spotifyAreaController.addLikeToSong(song);
                  spotifyAreaController.addLikeToSong(song);
                  songLikeDict[song.id] = 1;
                } else {
                  spotifyAreaController.addDislikeToSong(song);
                  songLikeDict[song.id] = 0;
                }
                setLikeDict({ ...songLikeDict });
              }}>
              {likeDict[song.id] === 1 ? <Icon as={AiFillLike} /> : <Icon as={AiOutlineLike} />}
            </Button>

            {/* Likes Ticker */}
            <Text>{song.likes}</Text>

            {/* Dislike Button */}
            <Button
              variant={likeDict[song.id] === -1 ? 'solid' : 'outline'}
              colorScheme='red'
              isActive={likeDict[song.id] === -1}
              onClick={() => {
                const songLikeDict = likeDict;
                if (likeDict[song.id] === 1) {
                  spotifyAreaController.addDislikeToSong(song);
                  spotifyAreaController.addDislikeToSong(song);
                  songLikeDict[song.id] = -1;
                } else if (likeDict[song.id] === 0) {
                  spotifyAreaController.addDislikeToSong(song);
                  songLikeDict[song.id] = -1;
                } else {
                  spotifyAreaController.addLikeToSong(song);
                  songLikeDict[song.id] = 0;
                }
                setLikeDict({ ...songLikeDict });
              }}>
              {likeDict[song.id] === -1 ? (
                <Icon as={AiFillDislike} />
              ) : (
                <Icon as={AiOutlineDislike} />
              )}
            </Button>
          </Grid>
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
      <Modal size={'4xl'} isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent bg='gray.800' color='white'>
          {/* <ModalHeader>Spotify Area</ModalHeader> */}
          <Flex align='center'>
            <Image src={'./images/spotify-icon.png'} alt='Spotify Logo' boxSize='30px' ml='4' />
            <ModalHeader fontSize='3xl'>Spotify</ModalHeader>
          </Flex>
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
