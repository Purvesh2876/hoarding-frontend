import {
  Avatar,
  Button,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { MdAccountCircle } from 'react-icons/md';
import logo from '../images/logi.png';
import { useNavigate } from 'react-router-dom';
import ToggleButton from './ToggleButton';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getMe, logout } from '../actions/userActions';

const Header = ({ isCollapsed, toggleCollapse }) => {
  const fontSize = useBreakpointValue({ base: '0.5rem', md: 'large', lg: 'xx-large' });
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState('');
  const [userRoles, setUserRoles] = React.useState([]);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const headerBgColor = useColorModeValue('rgba(255,255,255,0.8)', '#1A202C');

  React.useEffect(() => {
    const load = async () => {
      try {
        const me = await getMe();
        const name = me?.data?.name || '';
        const roles = Array.isArray(me?.data?.role) ? me.data.role : (JSON.parse(localStorage.getItem('userRole')) || []);
        setUserName(name);
        setUserRoles(Array.isArray(roles) ? roles : []);
      } catch (e) {
        const roles = JSON.parse(localStorage.getItem('userRole')) || [];
        setUserRoles(Array.isArray(roles) ? roles : []);
      }
    };
    load();
  }, []);

  return (
    <Stack
      pl={4}
      pr={4}
      pt={1}
      pb={1}
      justifyContent="space-between"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'fixed',
        width: { lg: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)' },
        // width: '100%',
        zIndex: 10,
        backdropFilter: 'blur(6px)',
        backgroundColor: headerBgColor,
        left: { base: '0', lg: isCollapsed ? '80px' : '280px' },
        transition: 'left 0.2s',
        top: '0px',
      }}
    >
      {/* <img width="3%" src={logo} alt="logo" /> */}
      <IconButton
        icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        onClick={toggleCollapse}
        mb={6}
        aria-label="Collapse sidebar"
        sx={{
          bg: 'transparent',
          color: '#9DA4AE',
          _hover: {
            bg: '#2C5282',
            color: 'white',
          },
        }}
      />

      <Heading fontSize={fontSize} display="flex" justifyContent="center" alignItems="center">
        {/* <img width="6%" src={logo} alt="logo" /> */}
        &nbsp; Hoarding Management System
      </Heading>

      <Stack direction="row" alignItems="center">
        <ToggleButton onClick={toggleCollapse} />
        <Menu>
          <MenuButton
            fontSize={fontSize}
            as={IconButton}
            icon={<MdAccountCircle />}
            aria-label="Profile"
            variant="outline"
          />
          <MenuList>
            <MenuItem>
              <Avatar size="sm" mr="2" name={userName} />
              <Stack spacing="0">
                <Text fontWeight="bold">{userName || 'User'}</Text>
                <Text fontSize="sm">{(userRoles || []).join(', ') || 'role'}</Text>
              </Stack>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Text color="red">
                Logout
              </Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </Stack>
    </Stack>
  );
};

export default Header;
