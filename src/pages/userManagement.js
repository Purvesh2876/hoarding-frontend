// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import SessionTimeout from './SessionTimeout';
import { Box, Button, CircularProgress, FormControl, FormLabel, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react';
import { addP2pCamera, getP2pCameras } from '../actions/cameraActions';
import { Link } from 'react-router-dom';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { FaSort } from "react-icons/fa";
import { MdAdd, MdError } from 'react-icons/md';
import { createUser, deleteUser, getAllUsers } from '../actions/adminActions';
import { allowDigitsOnly, allowAlphaSpaces, allowEmailChars, collectErrors, isNonEmpty, isValidEmail } from '../utils/validators';

const UserManagement = () => {

    const [users, setUsers] = useState([]);
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [querySearch, setQuerySearch] = useState('');
    const [page, setPage] = useState(1);
    const [resultPerPage, setResultPerPage] = useState(5);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [file, setFile] = useState(null);

    const getConfig = async (page, querySearch) => {
        try {
            const response = await getAllUsers(page, querySearch);
            setUsers(response.data);
            console.log('response', response.data);
            setTotalPages(response.totalPages);
            setResultPerPage(response.limit);
        } catch (error) {
            toast.error(error.response.data.message);
            console.error('Error:', error);
            // navigate('/404');
        }
    };

    useEffect(() => {
        getConfig();
    }, []);

    const openModal = (modal, id, cameraName) => {
        // console.log("cameraId");
        setActiveModal(modal);
        setUserIdToDelete(id);
        // setSelectedCameraId(cameraId);
        // setSelectedCameraName(cameraName);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        // setActiveTab("General");
        onClose();
    };

    // pagination code

    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState();

    const handleNextClick = async () => {

        const nextPage = currentPage + 1;
        setLoadingNext(true); // Show loading spinner
        try {
            await getConfig(nextPage, email);
            setcurrentPage(nextPage);
            // console.log(currentPage);

        } finally {
            setLoadingNext(false); // Hide loading spinner
        }

    };
    const handlePrevClick = async () => {

        const PrevPage = currentPage - 1;
        setLoadingPrev(true); // Show loading spinner
        try {
            await getConfig(PrevPage, email);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false); // Hide loading spinner
        }
    };

    const handleAddUser = async () => {
        try {
            const errors = collectErrors([
                { valid: isNonEmpty(name), message: 'Enter name' },
                { valid: isValidEmail(email), message: 'Enter valid email' },
                { valid: isNonEmpty(mobile), message: 'Enter mobile' },
                { valid: isNonEmpty(password), message: 'Enter password' },
            ]);
            if (errors.length) { toast.error(errors[0]); return; }
            const addUser = await createUser(name, email, mobile, password);
            closeModal();
            getConfig();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // const handleDeleteUser = async (id) => {
    //     try {
    //         const response = await deleteUser(id);
    //         getConfig();
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const confirmDelete = async () => {
        try {
            const deleteAdmin = await deleteUser(userIdToDelete);
            getConfig(); // Refresh data after deletion
        } catch (error) {
            console.error('Error:', error);
        } finally {
            closeModal();
        }
    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
        // fetchCameraList(currentPage);
    }, [currentPage, totalPages]);


    return (
        <>
            <Box p={8} mx={20} display={'flex'} flexDirection={'column'}>
                <ToastContainer />
                <SessionTimeout timeoutDuration={1800000} />

                <Box mt={4} mb={2}>
                    <Text
                        sx={{
                            color: "var(--primary-txt, #141E35)",
                            fontFamily: "Inter",
                            fontSize: "4xl",
                            fontStyle: "normal",
                            fontWeight: "700",
                            lineHeight: "normal",
                            textTransform: "capitalize",
                            textAlign: "left",
                        }}
                    >
                        User Management
                    </Text>
                </Box>

                <Stack
                    direction={['column', 'row']} // Column on mobile, row on larger screens
                    // justify="flex-end"
                    align="center"
                    spacing={4} // Space between Input and Button
                    mb={1}
                >
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Device ID"
                        size="md"
                        maxWidth="200px"
                        focusBorderColor="green.400" // Custom border color on focus
                        _focus={{
                            boxShadow: 'none', // Remove default shadow
                            borderColor: 'green.400', // Custom border color on focus
                        }}
                    />
                    <Button
                        onClick={() => openModal('Add Camera')}
                        colorScheme='green'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        ADD
                    </Button>
                    <Button
                        onClick={() => { getConfig(page, email) }}
                        colorScheme='blue'
                        variant='outline'
                        size='md' // Changed to 'md' for better alignment
                    >
                        Search
                    </Button>
                </Stack>

                <TableContainer
                    width="100%"
                    // maxW="1200px"
                    mx="auto"
                    mt="4"
                    // border="1px"
                    // borderColor="gray.200"
                    boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"}
                    borderRadius="md">
                    <Table>
                        {/* <TableCaption>Your Installed Camera List</TableCaption> */}
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Device ID</Th>
                                <Th>Email</Th>
                                <Th>Mob.</Th>
                                <Th>Role</Th>
                                <Th>Edit/Delete</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users && users.length > 0 ? (
                                users.map((camera, index) => (
                                    <Tr key={index}>
                                        <Td>
                                            {index + 1 + (currentPage - 1) * resultPerPage}
                                        </Td>
                                        <Td>
                                            {camera.name}
                                        </Td>
                                        <Td>
                                            {camera.email}
                                        </Td>
                                        <Td>
                                            {camera.mobile}
                                        </Td>
                                        <Td>
                                            {camera.role}
                                        </Td>
                                        <Td textAlign="center" display={'flex'}>
                                            {/* <Button
                                            variant={'outline'}

                                            // onClick={() => handleEdit(camera)}
                                            >
                                                Edit
                                            </Button> */}
                                            <Button
                                                variant={'outline'}
                                                colorScheme='red'
                                                onClick={() => openModal('Delete User', camera._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan="4" textAlign="center" borderColor="gray.300">
                                        No data available
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>

                    </Table>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                        {currentPage}/{totalPages}
                        <Box>
                            <Button sx={{ marginRight: '5px' }} hidden={currentPage === 1} onClick={handlePrevClick} leftIcon={<MdAdd />} >
                                {loadingPrev ? <CircularProgress isIndeterminate size={10} /> : 'Prev'}
                            </Button>
                            <Button hidden={currentPage === totalPages} onClick={handleNextClick} leftIcon={<MdAdd />} >
                                {loadingNext ? <CircularProgress isIndeterminate size={10} /> : 'Next'}
                            </Button>
                        </Box>
                    </div>
                </TableContainer>

            </Box >
            <Modal
                onClose={onClose}
                isOpen={isOpen && activeModal === "Add Camera"}
                isCentered
                size={"lg"}
            >
                <ModalOverlay />
                <ModalContent
                    // bg={useColorModeValue("white", theme.colors.custom.darkModeBg)}
                    color={"black"}
                >
                    <ModalHeader
                        textAlign={"center"}
                        p={1}
                        mt={4}
                    // color={useColorModeValue(
                    //     theme.colors.custom.lightModeText,
                    //     theme.colors.custom.darkModeText
                    // )}
                    >
                        Add User
                    </ModalHeader>
                    <ModalBody pb={6} textAlign="center">
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                            //   padding="10px"
                            p={1}
                        >
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                >
                                    Name:
                                </FormLabel>
                                <Input
                                    placeholder="Name"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={allowAlphaSpaces}
                                />
                            </FormControl>
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                >
                                    Email:
                                </FormLabel>
                                <Input
                                    placeholder="Email"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={allowEmailChars}
                                />
                            </FormControl>
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                >
                                    Mobile:
                                </FormLabel>
                                <Input
                                    placeholder="Mobile"
                                    borderColor="gray"
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    onKeyDown={allowDigitsOnly}

                                />
                            </FormControl>
                            <FormControl width="350px" mt={5}>
                                <FormLabel
                                    htmlFor="device-name"
                                    textAlign="start"
                                >
                                    Password:
                                </FormLabel>
                                <Input
                                    placeholder="Password"
                                    borderColor="gray"
                                    type='password'
                                    borderRadius="10px"
                                    px={4}
                                    _placeholder={{ color: "gray.400" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormControl>

                        </Box>
                        {uploadStatus &&
                            <Text display={'flex'}
                                alignItems={'center'}
                                justifyContent={'center'}
                                color={'red'}>
                                <MdError />&nbsp;{uploadStatus}
                            </Text>}
                    </ModalBody>

                    <ModalFooter marginRight={"10px"} justifyContent={"space-evenly"}>
                        <Button
                            onClick={closeModal}
                            w="150px"
                            border="1px"
                            background="0"
                            color="red.500"
                            borderColor="red.500"
                            _hover={{ background: "none" }}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => handleAddUser()}
                            w="150px"
                            // background={useColorModeValue(
                            //     theme.colors.custom.primary,
                            //     theme.colors.custom.darkModePrimary
                            // )}
                            // color={useColorModeValue(
                            //     theme.colors.custom.lightModeText,
                            //     theme.colors.custom.darkModeText
                            // )}
                            fontWeight={"normal"}
                        // _hover={{
                        //     backgroundColor: useColorModeValue(
                        //         theme.colors.custom.darkModePrimary,
                        //         theme.colors.custom.primary
                        //     ),
                        //     color: useColorModeValue(
                        //         theme.colors.custom.darkModeText,
                        //         theme.colors.custom.lightModeText
                        //     ),
                        // }}
                        >
                            Add User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen && activeModal === "Delete User"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this user?
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default UserManagement;
