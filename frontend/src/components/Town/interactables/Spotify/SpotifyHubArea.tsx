import {
  Button,
  Container,
  Flex,
  Heading,
  List,
  Modal,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import SpotifyAreaController from '../../../../classes/interactable/Spotify/SpotifyAreaController';
import { useInteractable, useInteractableAreaController, useSpotifyAreaController } from '../../../../classes/TownController';

import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import SpotifyArea from './SpotifyArea';

function SpotifyHubArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useSpotifyAreaController(interactableID);

  const [queue, setQueue] = useState(spotifyAreaController.queue);

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
              }}
            >
              Like
            </Button>
            <Button
              onClick={() => {
                console.log('song disliked');
              }}
            >
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

  const closeModal = useCallback(() => {
    if (spotifyArea) {
      townController.interactEnd(spotifyArea);
      // const controller = townController.getSpotifyAreaController(spotifyArea);
    }
  }, [townController, spotifyArea]);

  if (spotifyArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalHeader>{spotifyArea.name}</ModalHeader>
        <SpotifyHubArea interactableID={spotifyArea.name} />
      </Modal>
    );
  }
  return <></>;
}
