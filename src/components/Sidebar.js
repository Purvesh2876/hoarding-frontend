import React from 'react';
import { Box, VStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, IconButton, HStack, Image } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import { getMe } from '../actions/userActions';
import { BsRecordCircle } from 'react-icons/bs';
import logo from '../images/ArcisAi.png';
import logi from '../images/logi.png';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isSales, setIsSales] = React.useState(false);
  const [isMarketing, setIsMarketing] = React.useState(false);
  const [isDealer, setIsDealer] = React.useState(false);
  const [isStockist, setIsStockist] = React.useState(false);
  const [isDistributor, setIsDistributor] = React.useState(false);
  const [isMarketingLead, setIsMarketingLead] = React.useState(false);
  const [isMarketingLeadOnly, setIsMarketingLeadOnly] = React.useState(false);
  React.useEffect(() => {
    const load = async () => {
      const me = await getMe();
      const roles = me?.data?.role || [];
      setIsAdmin(Array.isArray(roles) && roles.includes('admin'));
      setIsSales(Array.isArray(roles) && roles.includes('sales'));
      setIsMarketing(Array.isArray(roles) && roles.includes('marketing'));
      setIsDealer(Array.isArray(roles) && roles.includes('dealer'));
      setIsStockist(Array.isArray(roles) && roles.includes('stockist'));
      setIsDistributor(Array.isArray(roles) && roles.includes('distributor'));
      const hasMarketingLead = Array.isArray(roles) && roles.includes('marketing-lead');
      setIsMarketingLead(hasMarketingLead);
      const privileged = ['admin', 'sales', 'marketing', 'stockist', 'distributor', 'dealer'];
      setIsMarketingLeadOnly(hasMarketingLead && !roles.some(r => privileged.includes(r)));
    };
    load();
  }, []);

  return (
    <>
      {/* Sidebar for larger screens */}

      <Box
        display={{ base: 'none', lg: 'block' }}
        width={isCollapsed ? "80px" : "280px"}
        background='#1C2536'
        height="100vh"
        boxShadow="md"
        transition="width 0.2s"
        position="fixed"
        top="0"
        left="0"
        zIndex={100}
      >
        {/* {!isCollapsed ?
          <Image m={'1.5rem'} src={logo} alt="Logo" width="50%" alignSelf={"center"} mx={"auto"} />
          : <Image m={'auto'} my={5} src={logi} alt="Logo" width="60%" />

        } */}
        <hr />
        <Box
          padding="1rem">
          <VStack spacing={1} align="stretch">


            {!isMarketingLeadOnly && (
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/dashboard') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/dashboard') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Dashboard</span>}
                  </HStack>
                </Box>
              </Link>
            )}
            {/* {!isMarketingLeadOnly && (
              <Link to="/requests" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/requests') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/requests') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/requests') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Requests</span>}
                  </HStack>
                </Box>
              </Link>
            )} */}

            {/* <Link to="/leads" style={{ textDecoration: 'none' }}>
              <Box
                as="button"
                width="100%"
                alignItems="center"
                justifyContent="left"
                bg={isActive('/leads') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                color={isActive('/leads') ? 'white' : '#9DA4AE'}
                fontSize="sm"
                _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                p={2}
                borderRadius="md"
                border="none"
                cursor="pointer"
                display="flex"
              >
                <HStack spacing={isCollapsed ? 0 : 4}>
                  <BsRecordCircle color={isActive('/leads') ? '#9678E1' : '#9DA4AE'} />
                  {!isCollapsed && <span>Leads</span>}
                </HStack>
              </Box>
            </Link> */}
            <Link to="/enquiries" style={{ textDecoration: 'none' }}>
              <Box
                as="button"
                width="100%"
                alignItems="center"
                justifyContent="left"
                bg={isActive('/enquiries') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                color={isActive('/enquiries') ? 'white' : '#9DA4AE'}
                fontSize="sm"
                _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                p={2}
                borderRadius="md"
                border="none"
                cursor="pointer"
                display="flex"
              >
                <HStack spacing={isCollapsed ? 0 : 4}>
                  <BsRecordCircle color={isActive('/enquiries') ? '#9678E1' : '#9DA4AE'} />
                  {!isCollapsed && <span>Enquiries</span>}
                </HStack>
              </Box>
            </Link>
            <Link to="/hoardings" style={{ textDecoration: 'none' }}>
              <Box
                as="button"
                width="100%"
                alignItems="center"
                justifyContent="left"
                bg={isActive('/hoardings') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                color={isActive('/hoardings') ? 'white' : '#9DA4AE'}
                fontSize="sm"
                _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                p={2}
                borderRadius="md"
                border="none"
                cursor="pointer"
                display="flex"
              >
                <HStack spacing={isCollapsed ? 0 : 4}>
                  <BsRecordCircle color={isActive('/hoardings') ? '#9678E1' : '#9DA4AE'} />
                  {!isCollapsed && <span>Hoardings</span>}
                </HStack>
              </Box>
            </Link>
            {!isMarketingLeadOnly && (
              <Link to="/orders" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/orders') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/orders') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/orders') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Orders</span>}
                  </HStack>
                </Box>
              </Link>
            )}
            {!isMarketingLeadOnly && (isAdmin || isSales || isMarketing) && (
              <Link to="/customers" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/customers') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/customers') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/customers') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>Customers</span>}
                  </HStack>
                </Box>
              </Link>
            )}
            {!isMarketingLeadOnly && (isAdmin || isSales || isMarketing) && (
              <Link to="/usersHoarding" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/usersHoarding') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/usersHoarding') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/usersHoarding') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>User Management</span>}
                  </HStack>
                </Box>
              </Link>
            )}
            {!isMarketingLeadOnly && (isStockist || isDistributor) && (
              <Link to="/myteam" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  width="100%"
                  alignItems="center"
                  justifyContent="left"
                  bg={isActive('/myteam') ? 'rgba(255,255,255,0.1)' : 'transparent'}
                  color={isActive('/myteam') ? 'white' : '#9DA4AE'}
                  fontSize="sm"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  display="flex"
                >
                  <HStack spacing={isCollapsed ? 0 : 4}>
                    <BsRecordCircle color={isActive('/myteam') ? '#9678E1' : '#9DA4AE'} />
                    {!isCollapsed && <span>My Team</span>}
                  </HStack>
                </Box>
              </Link>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Hamburger icon for mobile view */}
      <IconButton
        ref={btnRef}
        icon={<HamburgerIcon />}
        display={{ base: 'block', lg: 'none' }}
        onClick={onOpen}
        position="fixed"
        top="1rem"
        left="1rem"
        zIndex={11}
      />

      {/* Drawer for mobile view */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  colorScheme="teal"
                  variant="ghost"
                  onClick={onClose}
                  fontSize="sm"
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  bg="transparent"
                  _hover={{ bg: 'teal.50' }}
                  width="100%"
                  textAlign="left"
                >
                  Dashboard
                </Box>
              </Link>
              <Link to="/deviceinfo" style={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  colorScheme="teal"
                  variant="ghost"
                  onClick={onClose}
                  fontSize="sm"
                  p={2}
                  borderRadius="md"
                  border="none"
                  cursor="pointer"
                  bg="transparent"
                  _hover={{ bg: 'teal.50' }}
                  width="100%"
                  textAlign="left"
                >
                  Deviceinfo
                </Box>
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Sidebar;
