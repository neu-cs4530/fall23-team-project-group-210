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
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TownController, { useInteractable, useSpotifyAreaController } from '../../../../classes/TownController';

import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';

function SpotifyHubArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useSpotifyAreaController(interactableID);

  const [queue, setQueue] = useState(spotifyAreaController.queue);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to store the search term
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to store the search results

  const handleSearch = async () => {
    // Implement your Spotify search logic here. You may want to use the Spotify API or another service.
    // For simplicity, let's assume a function called searchSpotify in your spotifyAreaController.
    // try {
    //   const results = await spotifyAreaController.searchSpotify(searchTerm);
    //   setSearchResults(results);
    // } catch (error) {
    //   console.error('Error searching for songs:', error);
    // }
  };

  useEffect(() => {
    const updateSpotifyState = () => {
      setQueue(spotifyAreaController.queue);
    };
    spotifyAreaController.addListener('queueUpdated', updateSpotifyState);
    return () => {
      spotifyAreaController.removeListener('queueUpdated', updateSpotifyState);
    };
  }, [spotifyAreaController, spotifyAreaController.queue]);

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
        {/* Button to trigger the search */}
        <Button onClick={handleSearch}>Search</Button>
      </InputGroup>

      {/* Display search results */}
      <List aria-label='list of search results'>
        {searchResults.map((result) => (
          <Flex data-testid='search-result' key={result.id} align='center'>
            <Text>{result.name}</Text>
            <Button
              onClick={() => {
                // Add logic to add the selected song to the queue
                console.log('Song added to queue:', result.name);
              }}>
              Add to Queue
            </Button>
          </Flex>
        ))}
      </List>


      <Heading as='h2' size='md'>
        Spotify Song Queue
      </Heading>
      <List aria-label='list of songs in the queue'>
        {queue.queue().map(song => (
          <Flex data-testid='song' key={song.name} align='center'>
            <Text>{song.name}</Text>
            {/* Add like/dislike buttons for each song in the queue, which would update the likes/dislikes fields in each song */}
            <Button
              onClick={() => {
                console.log('song liked');
              }}>
              Like
            </Button>
            <Button
              onClick={() => {
                console.log('song disliked');
              }}>
              Dislike
            </Button>
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
