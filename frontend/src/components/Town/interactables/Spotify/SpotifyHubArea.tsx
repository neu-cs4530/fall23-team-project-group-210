import { Container, Flex, Heading, List, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import SpotifyAreaController from "../../../../classes/interactable/Spotify/SpotifyAreaController";
import { useInteractable, useInteractableAreaController } from "../../../../classes/TownController";

import useTownController from "../../../../hooks/useTownController";
import { InteractableID } from "../../../../types/CoveyTownSocket";
import Interactable from "../../Interactable";

function SpotifyArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const spotifyAreaController = useInteractableAreaController<SpotifyAreaController>(interactableID);
  const townController = useTownController();

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
      <Heading as="h2" size="md">
        Spotify Song Queue
      </Heading>
      <List aria-label="list of songs in the queue">
        {queue.queue().map((song) => (
          <Flex key={song.name} align="center">
            {/* <Image src={song.albumArt} alt="album art" boxSize="50px" /> To be implemented */}
            <Text>{song.name}</Text>
          </Flex>
        ))}
      </List>
    </Container>
  );
}

export default function SpotifyAreaWrapper(): JSX.Element {
  const townController = useTownController();
  const spotifyArea = useInteractable<Interactable>('spotifyArea');

  const closeModal = useCallback(() => {
    if (spotifyArea) {
      townController.interactEnd(spotifyArea);
      const controller = townController.getSpotifyAreaController(spotifyArea);
    }
  }, [townController, spotifyArea]);

  return <></>;
}