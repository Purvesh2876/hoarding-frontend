// pages/Hoardings.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Stack,
    Input,
    Button,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    TableContainer,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    CircularProgress,
    Select,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createHoarding, getAllHoardings, updateHoarding } from '../actions/hoardingsActions';

const Hoardings = () => {
    // ================= STATES =================
    const [hoardings, setHoardings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editableHoardingId, setEditableHoardingId] = useState(null);
    const [editedStatus, setEditedStatus] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        type: '',
        size: '',
        status: '',
        ownershipType: 'owned',
        rentAmount: '',
        city: '',
        area: '',
        facingDirection: '',
        pricePerMonth: 0,
        latitude: 0,
        longitude: 0
    });

    // ================= FETCH =================
    const fetchHoardings = async () => {
        try {
            setLoading(true);
            const res = await getAllHoardings(page, search, itemsPerPage);
            setHoardings(res.data || []);
            setTotalItems(res.total || 0);
            setTotalPages(res.totalPages || 1);
            setLoading(false);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch hoardings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHoardings();
    }, [itemsPerPage, page]);

    // ================= HANDLE =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (hoarding) => {
        setEditableHoardingId(hoarding._id);
        setEditedStatus(hoarding.status);
    };

    const handleSaveClick = async (id) => {
        try {
            await updateHoarding(id, editedStatus);
            toast.success('Hoarding status updated');
            setEditableHoardingId(null);
            fetchHoardings();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openAddModal = () => {
        setFormData({
            name: '',
            location: '',
            type: '',
            size: '',
            status: 'available',
            ownershipType: 'owned',
            rentAmount: '',
        });
        onOpen();
    };

    // ================= SUBMIT =================
    // const handleSubmit = async () => {
    //     try {
    //         if (!formData.name || !formData.location || !formData.type) {
    //             toast.error('Please fill all required fields');
    //             return;
    //         }

    //         const payload = {
    //             ...formData,
    //             rentAmount:
    //                 formData.ownershipType === 'rented'
    //                     ? Number(formData.rentAmount)
    //                     : undefined,
    //         };

    //         await createHoarding(payload);
    //         toast.success('Hoarding created successfully');
    //         onClose();
    //         fetchHoardings();
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };
    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.location || !formData.type || !formData.city || !formData.area || !formData.facingDirection) {
                toast.error('Please fill all required fields');
                return;
            }

            const payload = {
                ...formData,
                pricePerMonth: Number(formData.pricePerMonth) || 0,
                latitude: Number(formData.latitude) || 0,
                longitude: Number(formData.longitude) || 0,
                rentAmount:
                    formData.ownershipType === 'rented'
                        ? Number(formData.rentAmount)
                        : undefined,
            };

            await createHoarding(payload);
            toast.success('Hoarding created successfully');
            onClose();
            fetchHoardings();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSearch = () => fetchHoardings();
    const goToPreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const goToNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };


    // // ================= FILTER =================
    // const filteredHoardings = hoardings.filter((h) =>
    //     h.name.toLowerCase().includes(search.toLowerCase())
    // );

    // ================= UI =================
    return (
        <Box p={8} mx={20} display={'flex'} flexDirection={'column'}>
            <ToastContainer />

            <Box mt={4} mb={2}>
                <Text fontSize="4xl" fontWeight="700" textAlign="left">
                    Hoardings
                </Text>
            </Box>

            {/* Top Actions */}
            <Stack direction={['column', 'row']} align="center" justifyContent={'space-between'} spacing={4} mb={3}>
                <Stack spacing={4} display={'flex'} flexDirection={'row'}>
                    <Stack direction={['column', 'row']} align="center" spacing={4}>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Hoardings"
                            size="md"
                            maxWidth="200px"
                            focusBorderColor="green.400"
                            _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                        />
                        <Button onClick={handleSearch} colorScheme="blue" variant="outline" size="md">
                            Search
                        </Button>
                    </Stack>
                    <Button onClick={openAddModal} colorScheme="green" variant="outline" size="md">
                        ADD HOARDING
                    </Button>
                </Stack>
                <Stack>
                    <Select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        maxW="150px"
                    >
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </Select>
                </Stack>
            </Stack>

            {/* Table */}
            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                <Table>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Sr.No.</Th>
                            <Th>Name</Th>
                            <Th>City</Th>
                            <Th>Area</Th>
                            <Th>Location</Th>
                            <Th>Type</Th>
                            <Th>Size</Th>
                            <Th>Status</Th>
                            <Th>Ownership</Th>
                            <Th>Rent</Th>
                            <Th>Facing Direction</Th>
                            <Th>Price Per Month</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="9" textAlign="center">
                                    <CircularProgress isIndeterminate color="green.400" />
                                </Td>
                            </Tr>
                        ) : (
                            hoardings?.map((h, idx) => (
                                <Tr key={h._id}>
                                    <Td>{idx + 1}</Td>
                                    <Td>{h.name}</Td>
                                    <Td>{h.city}</Td>
                                    <Td>{h.area}</Td>
                                    <Td>{h.location}</Td>
                                    <Td>{h.type}</Td>
                                    <Td>{h.size}</Td>
                                    <Td>
                                        {editableHoardingId === h._id ? (
                                            <Select
                                                value={editedStatus}
                                                onChange={(e) => setEditedStatus(e.target.value)}
                                                size="sm"
                                                maxW="150px"
                                            >
                                                <option value="available">Available</option>
                                                <option value="under_maintenance">Under Maintenance</option>
                                                <option value="booked">Booked</option>
                                            </Select>
                                        ) : (
                                            h.status
                                        )}
                                    </Td>
                                    <Td>{h.ownershipType === 'rented' ? 'Rented' : 'Owned'}</Td>
                                    <Td>{h.ownershipType === 'rented' ? h.rentAmount : '-'}</Td>
                                    <Td>{h.facingDirection}</Td>
                                    <Td>{h.pricePerMonth}</Td>
                                    <Td>
                                        {editableHoardingId === h._id ? (
                                            <>
                                                <Button
                                                    variant="solid"
                                                    colorScheme="green"
                                                    size="sm"
                                                    onClick={() => handleSaveClick(h._id)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditableHoardingId(null)}
                                                    ml={2}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => handleEditClick(h)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            <Stack direction="row" justify="space-between" align="center" mt={4}>
                <Text>
                    Showing {(page - 1) * itemsPerPage + 1} – {Math.min(page * itemsPerPage, totalItems)} of {totalItems}
                </Text>
                <Stack direction="row" spacing={2}>
                    <Button onClick={goToPreviousPage} isDisabled={page === 1}>
                        Previous
                    </Button>
                    <Text display={'flex'} alignItems={'center'}>Page {page} of {totalPages}</Text>
                    <Button onClick={goToNextPage} isDisabled={page === totalPages}>
                        Next
                    </Button>
                </Stack>
            </Stack>

            {/* Add Modal */}
            {/* <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Hoarding</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <Input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <Input
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                            <Input
                                name="type"
                                placeholder="Type"
                                value={formData.type}
                                onChange={handleChange}
                            />
                            <Input
                                name="size"
                                placeholder="Size"
                                value={formData.size}
                                onChange={handleChange}
                            />
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="available">Available</option>
                                <option value="under_maintenance">Under Maintenance</option>
                                <option value="booked">Booked</option>
                            </Select>

                            <Box>
                                <Text mb={1} fontWeight="600">
                                    Ownership Type
                                </Text>
                                <Select
                                    name="ownershipType"
                                    value={formData.ownershipType}
                                    onChange={handleChange}
                                >
                                    <option value="owned">Owned</option>
                                    <option value="rented">Rented</option>
                                </Select>
                            </Box>

                            {formData.ownershipType === 'rented' && (
                                <Box>
                                    <Text mb={1} fontWeight="600">
                                        Rent Amount
                                    </Text>
                                    <Input
                                        type="number"
                                        name="rentAmount"
                                        placeholder="Enter monthly rent amount"
                                        value={formData.rentAmount}
                                        onChange={handleChange}
                                    />
                                </Box>
                            )}
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
            {/* Add Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Hoarding</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            {/* Name */}
                            <Input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                            {/* Location */}
                            <Input
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleChange}
                            />

                            {/* City */}
                            <Input
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                            />

                            {/* Area */}
                            <Input
                                name="area"
                                placeholder="Area"
                                value={formData.area}
                                onChange={handleChange}
                            />

                            {/* Facing Direction */}
                            <Input
                                name="facingDirection"
                                placeholder="Facing Direction (e.g. North, South)"
                                value={formData.facingDirection}
                                onChange={handleChange}
                            />

                            {/* Type */}
                            <Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                placeholder="Select Type"
                            >
                                <option value="flex">Flex</option>
                                <option value="led">LED</option>
                                <option value="hoarding">Hoarding</option>
                                <option value="wall">Wall</option>
                                <option value="gantry">Gantry</option>
                            </Select>

                            {/* Size */}
                            <Input
                                name="size"
                                placeholder="Size (e.g. 20x10 ft)"
                                value={formData.size}
                                onChange={handleChange}
                            />

                            {/* Price Per Month */}
                            <Input
                                type="number"
                                name="pricePerMonth"
                                placeholder="Price Per Month"
                                value={formData.pricePerMonth}
                                onChange={handleChange}
                            />

                            {/* Latitude */}
                            <Input
                                type="number"
                                name="latitude"
                                placeholder="Latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                            />

                            {/* Longitude */}
                            <Input
                                type="number"
                                name="longitude"
                                placeholder="Longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                            />

                            {/* Status */}
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="available">Available</option>
                                <option value="under_maintenance">Under Maintenance</option>
                                <option value="booked">Booked</option>
                            </Select>

                            {/* Ownership Type */}
                            <Box>
                                <Text mb={1} fontWeight="600">
                                    Ownership Type
                                </Text>
                                <Select
                                    name="ownershipType"
                                    value={formData.ownershipType}
                                    onChange={handleChange}
                                >
                                    <option value="owned">Owned</option>
                                    <option value="rented">Rented</option>
                                </Select>
                            </Box>

                            {/* Rent Amount (only if rented) */}
                            {formData.ownershipType === 'rented' && (
                                <Box>
                                    <Text mb={1} fontWeight="600">
                                        Rent Amount
                                    </Text>
                                    <Input
                                        type="number"
                                        name="rentAmount"
                                        placeholder="Enter monthly rent amount"
                                        value={formData.rentAmount}
                                        onChange={handleChange}
                                    />
                                </Box>
                            )}
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
};

export default Hoardings;
