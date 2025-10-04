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
    CircularProgress
} from '@chakra-ui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

import {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
} from '../actions/hoardingsActions';

const Customers = () => {
    // 🧠 States
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        area: '',
        segments: [],
    });
    const [editMode, setEditMode] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();

    // SEGMENT OPTIONS
    const segmentOptions = [
        { value: 'new', label: 'New' },
        { value: 'repeat', label: 'Repeat' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'individual', label: 'Individual' },
        { value: 'premium', label: 'Premium' },
        { value: 'inactive', label: 'Inactive' },
    ];



    // ================= FETCH CUSTOMERS =================
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await getAllCustomers(search ? { search } : {});
            setCustomers(data);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // ================= SEARCH =================
    const handleSearch = () => {
        fetchCustomers();
    };

    // ================= FORM CHANGE =================
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ================= OPEN ADD MODAL =================
    const openAddModal = () => {
        setEditMode(false);
        setSelectedCustomer(null);
        setFormData({
            name: '',
            email: '',
            mobile: '',
            address: '',
            city: '',
            area: '',
            segments: [],
        });
        onOpen();
    };

    // ================= OPEN EDIT MODAL =================
    const openEditModal = (customer) => {
        setEditMode(true);
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            mobile: customer.mobile || '',
            address: customer.address || '',
            city: customer.city || '',
            area: customer.area || '',
            segments: customer.segments || '',
        });
        onOpen();
    };

    // ================= HANDLE SUBMIT =================
    const handleSubmit = async () => {
        try {
            if (editMode && selectedCustomer) {
                await updateCustomer(selectedCustomer._id, formData);
                toast.success('Customer updated successfully');
            } else {
                if (!formData.name || !formData.mobile || !formData.city || !formData.area) {
                    toast.error('Name, Mobile, area & City are required');
                    return;
                }
                await createCustomer(formData);
                toast.success('Customer created successfully');
            }
            onClose();
            fetchCustomers();
        } catch (error) {
            toast.error(error);
        }
    };

    // ================= HANDLE DELETE =================
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
        try {
            await deactivateCustomer(id);
            toast.success('Customer deactivated successfully');
            fetchCustomers();
        } catch (error) {
            toast.error(error);
        }
    };

    // ================= FILTERED CUSTOMERS =================
    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.mobile.toLowerCase().includes(search.toLowerCase()) ||
            (c.city || '').toLowerCase().includes(search.toLowerCase())
                (c.area || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box p={8} mx={20} display={'flex'} flexDirection={'column'}>
            <ToastContainer />

            <Box mt={4} mb={2}>
                <Text
                    sx={{
                        color: "var(--primary-txt, #141E35)",
                        fontFamily: "Inter",
                        fontSize: "4xl",
                        fontWeight: "700",
                        textTransform: "capitalize",
                        textAlign: "left",
                    }}
                >
                    Customers
                </Text>
            </Box>

            {/* Top Actions */}
            <Stack direction={['column', 'row']} align="center" spacing={4} mb={3}>
                <Stack direction={['column', 'row']} align="center" spacing={4}>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Customers"
                        size="md"
                        maxWidth="250px"
                        focusBorderColor="green.400"
                        _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                    />
                    <Button onClick={handleSearch} colorScheme='blue' variant='outline' size='md'>
                        Search
                    </Button>
                </Stack>
                <Button onClick={openAddModal} colorScheme='green' variant='outline' size='md'>
                    ADD CUSTOMER
                </Button>
            </Stack>

            {/* Table */}
            <TableContainer boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"} borderRadius="md">
                <Table>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Sr.No.</Th>
                            <Th>Name</Th>
                            <Th>Mobile</Th>
                            <Th>Email</Th>
                            <Th>City</Th>
                            <Th>Area</Th>
                            <Th>Segments</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="7" textAlign="center">
                                    <CircularProgress isIndeterminate color="green.400" />
                                </Td>
                            </Tr>
                        ) : (
                            filteredCustomers.map((customer, index) => (
                                <Tr key={customer._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{customer.name}</Td>
                                    <Td>{customer.mobile}</Td>
                                    <Td>{customer.email || '-'}</Td>
                                    <Td>{customer.city || '-'}</Td>
                                    <Td>{customer.area || '-'}</Td>
                                    <Td>{customer.segments?.join(', ')}</Td>
                                    {/* <Td>{customer.segments || '-'}</Td> */}
                                    <Td>
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outline"
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => openEditModal(customer)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => handleDelete(customer._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Modal for Add/Edit */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editMode ? 'Edit Customer' : 'Add Customer'}</ModalHeader>
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
                                name="mobile"
                                placeholder="Mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                            <Input
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                            <Input
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <Input
                                name="area"
                                placeholder="Area"
                                value={formData.area}
                                onChange={handleChange}
                            />
                            <Box>
                                <Text mb={1} fontWeight="600">Customer Segments</Text>
                                <Select
                                    isMulti
                                    options={segmentOptions}
                                    value={segmentOptions.filter(opt => formData.segments.includes(opt.value))}
                                    onChange={(selectedOptions) =>
                                        setFormData({
                                            ...formData,
                                            segments: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                        })
                                    }
                                    placeholder="Select customer segments"
                                    closeMenuOnSelect={false}
                                />
                            </Box>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            {editMode ? 'Save Changes' : 'Add Customer'}
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

export default Customers;
