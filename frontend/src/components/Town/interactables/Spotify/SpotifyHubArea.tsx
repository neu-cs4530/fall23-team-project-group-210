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
  Input,
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
import { FaSearch, FaCommentDots, FaTimes } from 'react-icons/fa';

type Rating = -1 | 0 | 1;

type RatingDictionary = Record<string, Rating>;

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
  const [songLikeDict, setSongLikeDict] = useState<RatingDictionary>(
    queue.reduce((acc, song) => {
      acc[song.id] = 0;
      return acc;
    }, {} as Record<string, Rating>),
  ); // State to store the user's like/dislike status of each song]
  const [commentLikeDict, setCommentLikeDict] = useState<RatingDictionary>(
    // Initialize an empty dictionary. Then iterate through each song in the queue, and for each
    // comment in each song, add the comment to the dictionary with a value of 0
    queue.reduce((acc, song) => {
      song.comments.forEach(comment => {
        acc[comment.id] = 0;
      });
      return acc;
    }, {} as Record<string, Rating>),
  ); // State to store the user's like/dislike status of each comment]
  const [selectedSongForCommenting, setSelectedSongForCommenting] = useState<Song | undefined>(
    undefined,
  ); // State to store the selected song
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

      const newSongLikeDict = spotifyAreaController.queue.reduce((acc, song) => {
        const oldLikeStatus = songLikeDict[song.id];
        if (oldLikeStatus !== undefined) {
          acc[song.id] = songLikeDict[song.id];
        } else {
          acc[song.id] = 0;
        }
        return acc;
      }, {} as Record<string, Rating>);
      setSongLikeDict(newSongLikeDict);
      console.log('Updated songLikeDict: ', newSongLikeDict);

      const newCommentLikeDict = spotifyAreaController.queue.reduce((acc, song) => {
        song.comments.forEach(comment => {
          const oldLikeStatus = commentLikeDict[comment.id];
          if (oldLikeStatus !== undefined) {
            acc[comment.id] = commentLikeDict[comment.id];
          } else {
            acc[comment.id] = 0;
          }
        });
        return acc;
      }, {} as Record<string, Rating>);
      setCommentLikeDict(newCommentLikeDict);
      console.log('Updated commentLikeDict: ', newCommentLikeDict);
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
  }, [spotifyAreaController, songLikeDict, commentLikeDict, queue, townController]);

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
        <InputGroup mt={2}>
          <FormControl>
            <Input
              bg='white'
              color='black'
              type='text'
              style={{ width: '400px' }}
              placeholder='What do you want to listen to?'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleSearch(); // Trigger search when Enter key is pressed
                }
              }}
              paddingRight='10px' // Add padding to the right to make space for the clear button
            />
            {searchTerm && (
              <Icon
                as={FaTimes}
                position='absolute'
                right='3'
                top='50%'
                transform='translateY(-50%)'
                cursor='pointer'
                onClick={() => setSearchTerm('')}
              />
            )}
          </FormControl>
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
        <List aria-label='list of search results' mt={5}>
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
                      Genre: {songForAnalytics?.genre ? songForAnalytics.genre : 'unspecified'}{' '}
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
          mt={2}
          bg='gray.800'
          variant='outline'
          colorScheme='white'
          onClick={async () => {
            await spotifyAreaController.clearQueue();
          }}>
          Clear Queue
        </Button>
        <Button
          mt={2}
          ml={2}
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
        {/* if no songs in queue, just put a text that says queue is empty */}
        {queue.length === 0 && <Text>Queue is empty</Text>}
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
                variant={songLikeDict[song.id] === 1 ? 'green' : 'outline'}
                colorScheme='white'
                isActive={songLikeDict[song.id] === 1}
                onClick={async () => {
                  const likeDict = songLikeDict;
                  if (songLikeDict[song.id] === 0) {
                    await spotifyAreaController.addLikeToSong(song);
                    likeDict[song.id] = 1;
                  } else if (songLikeDict[song.id] === -1) {
                    await spotifyAreaController.addLikeToSong(song);
                    await spotifyAreaController.addLikeToSong(song);
                    likeDict[song.id] = 1;
                  } else {
                    await spotifyAreaController.addDislikeToSong(song);
                    likeDict[song.id] = 0;
                  }
                  setSongLikeDict({ ...likeDict });
                }}>
                {songLikeDict[song.id] === 1 ? (
                  <Icon as={AiFillLike} />
                ) : (
                  <Icon as={AiOutlineLike} />
                )}
              </Button>

              {/* Likes Ticker */}
              <Text>{song.likes}</Text>

              {/* Dislike Button */}
              <Button
                variant={songLikeDict[song.id] === -1 ? 'green' : 'outline'}
                colorScheme='white'
                isActive={songLikeDict[song.id] === -1}
                onClick={async () => {
                  const likeDict = songLikeDict;
                  if (songLikeDict[song.id] === 1) {
                    await spotifyAreaController.addDislikeToSong(song);
                    await spotifyAreaController.addDislikeToSong(song);
                    likeDict[song.id] = -1;
                  } else if (songLikeDict[song.id] === 0) {
                    await spotifyAreaController.addDislikeToSong(song);
                    likeDict[song.id] = -1;
                  } else {
                    await spotifyAreaController.addLikeToSong(song);
                    likeDict[song.id] = 0;
                  }
                  setSongLikeDict({ ...likeDict });
                }}>
                {songLikeDict[song.id] === -1 ? (
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
                  setSelectedSongForCommenting(song);
                  setCommentModalIsOpen(true);
                }}>
                <Icon as={FaCommentDots} mr={2} />
                Comments
              </Button>
            </Grid>
          ))}
        </List>

        {/* Modal for reading/writing comments */}
        {selectedSongForCommenting && (
          <Modal
            isCentered
            isOpen={commentModalIsOpen}
            onClose={() => {
              setSelectedSongForCommenting(undefined);
              setCommentModalIsOpen(false);
            }}>
            <ModalOverlay />
            <ModalContent bg='gray.800' color='white'>
              <ModalHeader>Write a comment for {selectedSongForCommenting.name}</ModalHeader>
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
                    if (commentInput === '') {
                      toast({
                        title: 'Error posting comment',
                        description: 'Comment cannot be empty',
                        status: 'error',
                      });
                      return;
                    }
                    await spotifyAreaController.addCommentToSong(
                      selectedSongForCommenting,
                      commentInput,
                    );
                    setCommentInput('');
                  }}>
                  Post
                </Button>
                {/* Show all comments */}
                <Heading as='h2' size='md' mt={4}>
                  Comments
                </Heading>
                {/* if no comments, just put a text that says no comments */}
                {selectedSongForCommenting.comments.length === 0 && <Text>No comments yet</Text>}
                <List aria-label='list of comments' mt={4}>
                  {selectedSongForCommenting.comments.map(comment => (
                    <Grid
                      key={comment.id}
                      templateColumns='200px 60px 20px 60px'
                      gap={2}
                      justifyItems='left'
                      alignItems='center'
                      justifyContent='center'
                      mt={4}
                      mb={2}>
                      <Text>
                        {comment.author}: {comment.body}
                      </Text>
                      {/* Like Button */}
                      {/* Add like/dislike buttons for each song in the queue, which would update the likes fields in each song */}
                      <Button
                        variant={commentLikeDict[comment.id] === 1 ? 'green' : 'outline'}
                        colorScheme='white'
                        isActive={commentLikeDict[comment.id] === 1}
                        onClick={() => {
                          const likeDict = commentLikeDict;
                          if (commentLikeDict[comment.id] === 0) {
                            spotifyAreaController.addLikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = 1;
                          } else if (commentLikeDict[comment.id] === -1) {
                            spotifyAreaController.addLikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            spotifyAreaController.addLikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = 1;
                          } else {
                            spotifyAreaController.addDislikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = 0;
                          }
                          setCommentLikeDict({ ...likeDict });
                        }}>
                        {commentLikeDict[comment.id] === 1 ? (
                          <Icon as={AiFillLike} />
                        ) : (
                          <Icon as={AiOutlineLike} />
                        )}
                      </Button>

                      {/* Likes Ticker */}
                      <Text>{comment.likes}</Text>

                      {/* Dislike Button */}
                      <Button
                        variant={commentLikeDict[comment.id] === -1 ? 'green' : 'outline'}
                        colorScheme='white'
                        isActive={commentLikeDict[comment.id] === -1}
                        onClick={() => {
                          const likeDict = commentLikeDict;
                          if (commentLikeDict[comment.id] === 1) {
                            spotifyAreaController.addDislikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            spotifyAreaController.addDislikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = -1;
                          } else if (commentLikeDict[comment.id] === 0) {
                            spotifyAreaController.addDislikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = -1;
                          } else {
                            spotifyAreaController.addLikeToComment(
                              comment,
                              selectedSongForCommenting,
                            );
                            likeDict[comment.id] = 0;
                          }
                          setCommentLikeDict({ ...likeDict });
                        }}>
                        {commentLikeDict[comment.id] === -1 ? (
                          <Icon as={AiFillDislike} />
                        ) : (
                          <Icon as={AiOutlineDislike} />
                        )}
                      </Button>
                    </Grid>
                  ))}
                </List>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </Container>
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
