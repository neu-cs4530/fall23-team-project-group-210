import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  List,
  Text,
} from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import SpotifyAreaController from "../../../../classes/interactable/Spotify/SpotifyAreaController";
import { useInteractableAreaController } from "../../../../classes/TownController";

import { useSpotify } from "../../../../hooks/useSpotify";
import useTownController from "../../../../hooks/useTownController";
import { InteractableID } from "../../../../types/CoveyTownSocket";

export default function SpotifyArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
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