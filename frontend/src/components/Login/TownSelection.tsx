import React, { useCallback, useEffect, useMemo, useState } from 'react';
import assert from 'assert';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Text,
  Td,
  Th,
  Thead,
  ToastId,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { Town } from '../../generated/client';
import { Device, SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk';
import useLoginController from '../../hooks/useLoginController';
import TownController, { SpotifyData } from '../../classes/TownController';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import { useSpotify } from '../../hooks/useSpotify';

export default function TownSelection(): JSX.Element {
  const clientID = 'ddf7330eed894b0f81b580cba2d1b570';

  const [userName, setUserName] = useState<string>('');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<Town[]>();
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isSpotifyAttempt, setIsSpotifyAttempt] = useState<boolean>(false);
  const [spotifyUser, setSpotifyUser] = useState<UserProfile>({} as UserProfile);
  const [spotifyDevice, setSpotifyDevice] = useState<Device>({
    is_active: false,
    is_private_session: false,
    is_restricted: false,
    name: 'Device Name',
    type: 'Not a Device',
  } as Device);
  const [spotifyDevices, setSpotifyDevices] = useState<Device[]>([] as Device[]);
  const spotifyToken = useMemo(
    () =>
      window.location.search !== ''
        ? new URLSearchParams(
            window.location.search.substring(window.location.search.indexOf('?code=') + 1),
          )
        : null,
    [],
  );

  const spotifyAPI: SpotifyApi | undefined = useSpotify(
    isSpotifyAttempt,
    clientID, // Figure out env variables
    `${window.location.protocol}//${window.location.host}`,
    [
      'streaming',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-read-private',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
    ],
  );

  const loginController = useLoginController();
  const { setTownController, townsService } = loginController;
  const { connect: videoConnect } = useVideoContext();
  const toast = useToast();

  useEffect(() => {
    const logAPISearch = async () => {
      console.log('Searching Spotify for devices...'); // Let's see if the API search is working
      try {
        // const items = await spotifyAPI?.search('The Beatles', ['artist']);
        const devices = await spotifyAPI?.player.getAvailableDevices();
        const items = devices?.devices;
        if (items) {
          setSpotifyDevices(items);
        }
        if (items) {
          console.table(
            items.map((item: Device) => ({
              name: item.name,
              type: item.type,
            })),
          );
        }
      } catch (err) {
        console.log(err);
      }
      return;
    };

    (async () => {
      const user = await spotifyAPI?.currentUser.profile();
      if (user) {
        setSpotifyUser(user);
        await logAPISearch();
      }
    })();
  }, [spotifyAPI]);

  useEffect(() => {
    (async () => {
      if (spotifyToken) {
        setIsSpotifyAttempt(true);
      }
    })();
  }, [spotifyToken]);

  const updateTownListings = useCallback(() => {
    townsService.listTowns().then(towns => {
      setCurrentPublicTowns(towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy));
    });
  }, [townsService]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(
    async (coveyRoomID: string) => {
      let connectWatchdog: NodeJS.Timeout | undefined = undefined;
      let loadingToast: ToastId | undefined = undefined;
      try {
        if (!userName || userName.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please select a username',
            status: 'error',
          });
          return;
        }
        if (!coveyRoomID || coveyRoomID.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please enter a town ID',
            status: 'error',
          });
          return;
        }
        const isHighLatencyTownService =
          process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL?.includes('onrender.com');
        connectWatchdog = setTimeout(() => {
          if (isHighLatencyTownService) {
            loadingToast = toast({
              title: 'Please be patient...',
              description:
                "The TownService is starting up - this may take 15-30 seconds, because it is hosted on a free Render.com service. Render.com's free tier automatically puts the TownService to sleep when it is inactive for 15 minutes.",
              status: 'info',
              isClosable: false,
              duration: null,
            });
          } else {
            loadingToast = toast({
              title: 'Connecting to town...',
              description: 'This is taking a bit longer than normal - please be patient...',
              status: 'info',
              isClosable: false,
              duration: null,
            });
          }
        }, 1000);
        setIsJoining(true);
        let spotifyDetails: SpotifyData | undefined;
        if (spotifyAPI) {
          spotifyDetails = { spotifyApi: spotifyAPI, device: undefined };
          if (spotifyDevice.name !== 'Device Name') {
            spotifyDetails.device = spotifyDevice;
          } else {
            toast({
              title: 'Spotify hub playback will not function',
              description: 'No spotify device specified',
              status: 'warning',
            });
          }
        } else {
          toast({
            title: 'Spotify Hubs will not function',
            description: 'Spotify login was not performed or failed',
            status: 'warning',
          });
        }
        const newController = new TownController({
          userName,
          townID: coveyRoomID,
          loginController,
        });
        newController.spotifyDetails = spotifyDetails;
        await newController.connect();
        const videoToken = newController.providerVideoToken;
        assert(videoToken);
        await videoConnect(videoToken);
        setIsJoining(false);
        if (loadingToast) {
          toast.close(loadingToast);
        }
        clearTimeout(connectWatchdog);
        setTownController(newController);
      } catch (err) {
        setIsJoining(false);
        if (loadingToast) {
          toast.close(loadingToast);
        }
        if (connectWatchdog) {
          clearTimeout(connectWatchdog);
        }
        if (err instanceof Error) {
          toast({
            title: 'Unable to connect to Towns Service',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected error, see browser console for details.',
            status: 'error',
          });
        }
      }
    },
    [userName, spotifyAPI, loginController, videoConnect, setTownController, toast, spotifyDevice],
  );

  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    const isHighLatencyTownService =
      process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL?.includes('onrender.com');
    let loadingToast: ToastId | undefined = undefined;
    const connectWatchdog = setTimeout(() => {
      if (isHighLatencyTownService) {
        loadingToast = toast({
          title: 'Please be patient...',
          description:
            "The TownService is starting up - this may take 15-30 seconds, because it is hosted on a free Render.com service. Render.com's free tier automatically puts the TownService to sleep when it is inactive for 15 minutes.",
          status: 'info',
          isClosable: false,
          duration: null,
        });
      } else {
        loadingToast = toast({
          title: 'Connecting to town...',
          description: 'This is taking a bit longer than normal - please be patient...',
          status: 'info',
          isClosable: false,
          duration: null,
        });
      }
    }, 2000);
    setIsJoining(true);
    try {
      const newTownInfo = await townsService.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      clearTimeout(connectWatchdog);
      setIsJoining(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage = (
          <p>
            This town will NOT be publicly listed. To re-enter it, you will need to use this ID:{' '}
            {newTownInfo.townID}
          </p>
        );
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the town:
            <br />
            Town ID: {newTownInfo.townID}
            <br />
            Town Editing Password: {newTownInfo.townUpdatePassword}
          </>
        ),
        status: 'success',
        isClosable: true,
        duration: null,
      });
      await handleJoin(newTownInfo.townID);
    } catch (err) {
      clearTimeout(connectWatchdog);
      setIsJoining(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (err instanceof Error) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected error, see browser console for details.',
          status: 'error',
        });
      }
    }
  };

  const DeviceOptions = () => {
    const deviceList = spotifyDevices.map(device => (
      <option key={device.id} value={device.name}>
        {device.name}
      </option>
    ));
    deviceList.push(
      <option key={'default'} value={'Device Name'}>
        Device Name
      </option>,
    );
    return <>{deviceList}</>;
  };
  const DeviceDropdown = () => {
    return (
      <div>
        <select
          value={spotifyDevice?.name}
          onChange={option => {
            const device = spotifyDevices?.find(
              (item: Device) => item.name === option.target.value,
            );
            console.log('Chosen Device: ' + device?.name);
            setSpotifyDevice({ ...device } as Device);
          }}>
          <DeviceOptions />
        </select>
        <Button
          onClick={async () => {
            const devices = await spotifyAPI?.player.getAvailableDevices();
            if (devices?.devices) {
              setSpotifyDevices(devices?.devices);
            }
          }}>
          Refresh Device List
        </Button>
      </div>
    );
  };

  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            {spotifyAPI ? (
              <>
                <Heading as='h2' size='lg'>
                  Spotify account for {spotifyUser.display_name} is connected.
                </Heading>
                <br />
                <br />
                <div>
                  <Text>Choose Device to Play Music</Text>
                  <DeviceDropdown />
                </div>
              </>
            ) : (
              <Button
                onClick={async () => {
                  setIsSpotifyAttempt(true);
                }}>
                Login to Spotify Account
              </Button>
            )}
          </Box>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Select a username
            </Heading>

            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Create a New Town
            </Heading>
            <Flex p='4'>
              <Box flex='1'>
                <FormControl>
                  <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                  <Input
                    name='townName'
                    placeholder='New Town Name'
                    value={newTownName}
                    onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox
                    id='isPublic'
                    name='isPublic'
                    isChecked={newTownIsPublic}
                    onChange={e => {
                      setNewTownIsPublic(e.target.checked);
                    }}
                  />
                </FormControl>
              </Box>
              <Box>
                <Button
                  data-testid='newTownButton'
                  onClick={handleCreate}
                  isLoading={isJoining}
                  disabled={isJoining}>
                  Create
                </Button>
              </Box>
            </Flex>
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Join an Existing Town
            </Heading>
            <Box borderWidth='1px' borderRadius='lg'>
              <Flex p='4'>
                <FormControl>
                  <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                  <Input
                    name='townIDToJoin'
                    placeholder='ID of town to join, or select from list'
                    value={townIDToJoin}
                    onChange={event => setTownIDToJoin(event.target.value)}
                  />
                </FormControl>
                <Button
                  data-testid='joinTownByIDButton'
                  onClick={() => handleJoin(townIDToJoin)}
                  isLoading={isJoining}
                  disabled={isJoining}>
                  Connect
                </Button>
              </Flex>
            </Box>

            <Heading p='4' as='h4' size='md'>
              Select a public town to join
            </Heading>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='bottom'>Publicly Listed Towns</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPublicTowns?.map(town => (
                    <Tr key={town.townID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.townID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy || isJoining}
                          isLoading={isJoining}>
                          Connect
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
