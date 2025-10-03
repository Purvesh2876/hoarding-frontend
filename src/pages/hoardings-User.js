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
} from '@chakra-ui/react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getAllUsers, createUserByAdmin, updateUserRole } from '../actions/hoardingsActions';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'sales', label: 'Sales' },
        { value: 'enquiry', label: 'Enquiry' },
    ];
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: [],
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ================= FORM CHANGE =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRoleChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
        setFormData({ ...formData, role: selectedOptions });
    };

    // ================= ADD USER MODAL =================
    const openAddModal = () => {
        setEditMode(false);
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
            role: [],
        });
        onOpen();
    };

    // ================= EDIT USER MODAL =================
    const openEditModal = (user) => {
        setEditMode(true);
        setSelectedUser(user);
        setFormData({
            ...formData,
            role: Array.isArray(user.role) ? user.role : [],
        });
        onOpen();
    };

    // ================= SUBMIT HANDLER =================
    const handleSubmit = async () => {
        try {
            if (editMode && selectedUser) {
                // ✏️ Update roles only
                await updateUserRole(selectedUser._id, formData.role);
                toast.success('User role updated successfully');
            } else {
                // ➕ Create user
                if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
                    toast.error('Please fill all required fields');
                    return;
                }
                await createUserByAdmin(formData);
                toast.success('User created successfully');
            }

            onClose();
            fetchUsers();
        } catch (error) {
            toast.error(error);
        }
    };

    // ================= SEARCH =================
    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.mobile.toLowerCase().includes(search.toLowerCase())
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
                    Users
                </Text>
            </Box>

            {/* Top Actions */}
            <Stack direction={['column', 'row']} align="center" spacing={4} mb={3}>
                <Stack direction={['column', 'row']} align="center" spacing={4}>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Users"
                        size="md"
                        maxWidth="200px"
                        focusBorderColor="green.400"
                        _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                    />
                </Stack>
                <Button onClick={openAddModal} colorScheme='green' variant='outline' size='md'>
                    ADD USER
                </Button>
            </Stack>

            {/* Users Table */}
            <TableContainer boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"} borderRadius="md">
                <Table>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Sr.No.</Th>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Mobile</Th>
                            <Th>Role</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="6" textAlign="center">
                                    <CircularProgress isIndeterminate color="green.400" />
                                </Td>
                            </Tr>
                        ) : (
                            filteredUsers?.map((user, index) => (
                                <Tr key={user._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{user?.name}</Td>
                                    <Td>{user?.email}</Td>
                                    <Td>{user?.role?.join(', ')}</Td>
                                    <Td>{user?.mobile}</Td>
                                    <Td>
                                        <Button
                                            variant="outline"
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => openEditModal(user)}
                                        >
                                            Edit
                                        </Button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editMode ? 'Edit User Role' : 'Add New User'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            {!editMode && (
                                <>
                                    <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                                    <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                                    <Input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </>
                            )}

                            <Box>
                                <Text mb={1} fontWeight="600">Role(s)</Text>
                                <Select
                                    isMulti
                                    options={roleOptions}
                                    value={roleOptions.filter(opt => formData.role.includes(opt.value))}
                                    onChange={(selectedOptions) =>
                                        setFormData({
                                            ...formData,
                                            role: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                        })
                                    }
                                    placeholder="Select roles"
                                    closeMenuOnSelect={false}
                                />
                            </Box>


                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            {editMode ? 'Save Changes' : 'Add User'}
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

export default Users;
