import {
  Box,
  Button,
  ChakraProvider,
  Container,
  extendTheme,
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
  Textarea,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useSpotifyAreaController } from '../../../../classes/TownController';

import useTownController from '../../../../hooks/useTownController';
import { InteractableID, Song } from '../../../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from 'react-icons/ai';
import { FaSearch } from 'react-icons/fa';

type SongRating = -1 | 0 | 1;

type SongDictionary = Record<string, SongRating>;

/**
 * A component that renders the Spotify Hub Area.
 * @param interactableID the ID of the Spotify Hub Area
 * @returns a component that renders the Spotify Hub Area
 */
function SpotifyHubArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useSpotifyAreaController(interactableID);
  const townController = useTownController();
  const [queue, setQueue] = useState(spotifyAreaController.queue);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to store the search term
  const [searchResults, setSearchResults] = useState<Song[]>([]); // State to store the search results
  const [songAnalytics, setSongAnalytics] = useState(false);
  const [songForAnalytics, setSongForAnalytics] = useState<Song>();
  const [likeDict, setLikeDict] = useState<SongDictionary>(
    spotifyAreaController.queue.reduce((acc, song) => {
      acc[song.id] = 0;
      return acc;
    }, {} as Record<string, SongRating>),
  ); // State to store the user's like/dislike status of each song
  const [commentModalIsOpen, setCommentModalIsOpen] = useState<boolean>(false); // State to store whether the comment modal is open
  const [commentInput, setCommentInput] = useState<string>(''); // State to store the comment input

  /**
   * Function to handle searching for a song.
   * @returns an error if the search fails, undefined otherwise
   */
  const handleSearch: () => Promise<Error | undefined> = async (): Promise<Error | undefined> => {
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

    const synchronizeQueues = () => {
      if (spotifyAreaController.queue.length !== 0) {
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

  const spotifyButtonTheme = extendTheme({
    colors: {
      spotifyGreen: '#1DB954',
    },
    components: {
      Button: {
        baseStyle: {
          color: 'white',
        },
        variants: {
          green: {
            bg: 'spotifyGreen',
            _hover: {
              bg: 'spotifyGreen', // Adjust hover color if needed
            },
          },
        },
      },
    },
  });

  const toast = useToast();
  return (
    <ChakraProvider theme={spotifyButtonTheme}>
      <Container>
        <Heading as='h2' size='md'>
          Song Search
        </Heading>
        {/* add small gap of 10 px */}
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
            mr={10}
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
            <Icon as={FaSearch} mr={2} />
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
              <Box w='50px' bg='red.500'>
                <Image src={result.albumImage.url} />
              </Box>
              <Text fontSize={15} w='200px' h='50px' noOfLines={[1, 2]}>
                {result.name} - {result.artists[0].name}
              </Text>
              <Button
                bg='gray.800'
                variant='outline'
                colorScheme='white'
                onClick={() => {
                  spotifyAreaController.addSongToQueue(result);
                }}>
                Add to Queue
              </Button>
              <Button
                bg='gray.800'
                variant='outline'
                colorScheme='white'
                onClick={() => {
                  setSongAnalytics(true);
                  setSongForAnalytics(result);
                }}>
                Song Attributes
              </Button>
              <Modal isOpen={songAnalytics} onClose={() => setSongAnalytics(false)}>
                <ModalOverlay />
                <ModalContent bg='gray.800' color='white'>
                  <ModalHeader>&quot;{songForAnalytics?.name}&quot; Analytics</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Text>
                      Genre:{' '}
                      {songForAnalytics?.genres && songForAnalytics.genres.length > 0
                        ? songForAnalytics.genres[0]
                        : 'unspecified'}{' '}
                    </Text>
                    <Text>
                      Danceability: {songForAnalytics?.songAnalytics?.danceability ?? 0}/1{' '}
                    </Text>
                    <Text>Energy: {songForAnalytics?.songAnalytics?.energy ?? 0}/1 </Text>
                    <Text>
                      Acousticness: {songForAnalytics?.songAnalytics?.acousticness ?? 0}/1{' '}
                    </Text>
                  </ModalBody>
                </ModalContent>
              </Modal>
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
          onClick={async () => {
            await spotifyAreaController.clearQueue();
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
        {/* The queue */}
        <List aria-label='list of songs in the queue' mb={10}>
          {queue.map(song => (
            <Grid
              key={song.id}
              data-testid='queue-song'
              templateColumns='100px 200px 60px 20px 100px 100px'
              gap={2}
              justifyItems='left'
              alignItems='center'
              justifyContent='center'
              mt={4}
              mb={2}>
              <Box w='50px' bg='red.500'>
                <Image src={song.albumImage.url} />
              </Box>
              {/* Text */}
              <Text fontSize={15} w='150px' noOfLines={[1, 2]}>
                {song.name} - {song.artists[0]?.name}
              </Text>

              {/* Like Button */}
              {/* Add like/dislike buttons for each song in the queue, which would update the likes fields in each song */}
              <Button
                variant={likeDict[song.id] === 1 ? 'green' : 'outline'}
                colorScheme='white'
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
                variant={likeDict[song.id] === -1 ? 'green' : 'outline'}
                colorScheme='white'
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
              {/* Button to post a comment */}
              <Button
                bg='gray.800'
                variant='outline'
                colorScheme='white'
                onClick={() => {
                  setCommentModalIsOpen(true);
                }}>
                Write comment
              </Button>
              {/* Button to save a song */}
              <Button
                bg='gray.800'
                variant='outline'
                colorScheme='white'
                onClick={async () => {
                  await spotifyAreaController.saveSong(song);
                }}>
                Save Song
              </Button>
            </Grid>
          ))}
        </List>

        <Heading as='h3' size='md'>
          Saved Songs
        </Heading>
        {/* Display the List of Saved Songs */}
        <List aria-label='list of save songs' mb={10}>
          {.map(song => (
            <Grid
              key={song.id}
              data-testid='queue-song'
              templateColumns='100px 200px 60px 20px 100px 100px'
              gap={2}
              justifyItems='left'
              alignItems='center'
              justifyContent='center'
              mt={4}
              mb={2}>
              <Box w='50px' bg='red.500'>
                <Image src={song.albumImage.url} />
              </Box>
              {/* Text */}
              <Text fontSize={15} w='150px' noOfLines={[1, 2]}>
                {song.name} - {song.artists[0]?.name}
              </Text>
        </List>
      </Container>

      {/* Modal for posting a comment */}
      <Modal isOpen={commentModalIsOpen} onClose={() => setCommentModalIsOpen(false)}>
        <ModalOverlay />
        <ModalContent bg='gray.800' color='white'>
          <ModalHeader>Write a comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Textarea
                placeholder='Write a comment'
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
              />
            </FormControl>
            <Button
              mt={4}
              bg='gray.800'
              variant='outline'
              colorScheme='white'
              onClick={async () => {
                // TODO: Implement postComment
                // await spotifyAreaController.postComment(commentInput);
                setCommentInput('');
                // setCommentModalIsOpen(false);
              }}>
              Post
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </ChakraProvider>
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
          <Flex justifyContent='center' align='center'>
            <Image src={'./images/spotify-icon.png'} alt='Spotify Logo' boxSize='40px' />
            <ModalHeader fontSize='4xl'>Spotify</ModalHeader>
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
