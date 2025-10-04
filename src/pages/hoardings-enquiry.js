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
    Textarea,
    useDisclosure,
    CircularProgress,
    IconButton,
    Select
} from '@chakra-ui/react';
import { MdAdd, MdRemoveCircleOutline } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createEnquiry, getAllEnquiries, getAllUsers, updateEnquiry } from '../actions/hoardingsActions';

const Enquiry = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        company: '',
        notes: '',
    });

    // for adding multiple new notes during edit
    const [newNotes, setNewNotes] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editMode, setEditMode] = useState(false);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);


    // ================= FETCH ENQUIRIES =================
    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const data = await getAllEnquiries(page, search, itemsPerPage);
            setEnquiries(data.data || []);
            setTotalItems(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error);
        }
    };

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            // console.log('users', data);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error);
        }
    }

    const goToPreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const goToNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };


    useEffect(() => {
        fetchUsers();
        fetchEnquiries();
    }, [page, itemsPerPage]);

    const handleSearch = () => fetchEnquiries();

    // ================= OPEN ADD ENQUIRY MODAL =================
    const openAddModal = () => {
        setEditMode(false);
        setSelectedEnquiry(null);
        setFormData({
            name: '',
            mobile: '',
            email: '',
            company: '',
            notes: '',
        });
        setNewNotes([]);
        onOpen();
    };

    // ================= OPEN EDIT ENQUIRY MODAL =================
    const openEditModal = (enquiry) => {
        setEditMode(true);
        setSelectedEnquiry(enquiry);
        setFormData({
            name: enquiry.name,
            mobile: enquiry.mobile,
            email: enquiry.email || '',
            company: enquiry.company || '',
            notes: '',
            assignedTo: enquiry.assignedUser?._id || enquiry.assignedUser || '',
            status: enquiry.status || 'pending'
        });
        setNewNotes([]); // clear new notes
        onOpen();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ================= HANDLE ADD NEW NOTE FIELD =================
    const addNoteField = () => {
        setNewNotes([...newNotes, '']);
    };

    // ================= HANDLE REMOVE NOTE FIELD =================
    const removeNoteField = (index) => {
        setNewNotes(newNotes.filter((_, i) => i !== index));
    };

    // ================= HANDLE CHANGE NOTE FIELD =================
    const handleNoteChange = (index, value) => {
        const updatedNotes = [...newNotes];
        updatedNotes[index] = value;
        setNewNotes(updatedNotes);
    };

    // ================= HANDLE SUBMIT =================
    const handleSubmit = async () => {
        try {
            if (editMode && selectedEnquiry) {
                const payload = {};

                if (newNotes.length > 0) {
                    payload.notes = newNotes.filter((n) => n.trim() !== '');
                }

                if (payload.notes?.length === 0) {
                    toast.info('No new notes added.');
                }

                if (formData.assignedTo) {
                    payload.assignedUser = formData.assignedTo;
                }

                if (formData.status) {
                    payload.status = formData.status;
                }

                await updateEnquiry(selectedEnquiry._id, payload);
                toast.success('Enquiry updated successfully');
            } else {
                if (!formData.notes.trim()) {
                    toast.error('Please add initial notes');
                    return;
                }

                const payload = { ...formData };
                if (formData.assignedTo) {
                    payload.assignedUser = formData.assignedTo;
                    delete payload.assignedTo;
                }
                await createEnquiry(payload);
                toast.success('Enquiry created successfully');
            }

            onClose();
            fetchEnquiries();
        } catch (error) {
            toast.error(error);
        }
    };

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
                    Enquiries
                </Text>
            </Box>

            {/* Top Actions */}
            <Stack direction={['column', 'row']} align="center" justifyContent={'space-between'} spacing={4} mb={3}>
                <Stack spacing={4} display={'flex'} flexDirection={'row'}>
                    <Stack direction={['column', 'row']} align="center" spacing={4}>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Enquiries"
                            size="md"
                            maxWidth="200px"
                            focusBorderColor="green.400"
                            _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                        />
                        <Button onClick={handleSearch} colorScheme='blue' variant='outline' size='md'>
                            Search
                        </Button>
                    </Stack>
                    <Button onClick={openAddModal} colorScheme='green' variant='outline' size='md'>
                        ADD ENQUIRY
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
            <TableContainer boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"} borderRadius="md">
                <Table>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Sr.No.</Th>
                            <Th>Name</Th>
                            <Th>Mobile</Th>
                            <Th>Company</Th>
                            <Th>Status</Th>
                            <Th>Notes Count</Th>
                            <Th>Assigned To</Th>
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
                            enquiries?.map((enq, index) => (
                                <Tr key={enq._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{enq.name}</Td>
                                    <Td>{enq.mobile}</Td>
                                    <Td>{enq.company || '-'}</Td>
                                    <Td>{enq.status}</Td>
                                    <Td>{enq.notes?.length || 0}</Td>
                                    <Td>
                                        {enq.assignedUser?.name || enq.assignedUserName || 'Unassigned'}
                                    </Td>
                                    <Td>
                                        <Button
                                            variant="outline"
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => openEditModal(enq)}
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

            {/* Modal for Add/Edit */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editMode ? 'Edit Enquiry' : 'Add Enquiry'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <Input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                isDisabled={editMode}
                            />
                            <Input
                                name="mobile"
                                placeholder="Mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                isDisabled={editMode}
                            />
                            <Input
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                isDisabled={editMode}
                            />
                            <Input
                                name="company"
                                placeholder="Company"
                                value={formData.company}
                                onChange={handleChange}
                                isDisabled={editMode}
                            />
                            <Select
                                name="assignedTo"
                                placeholder="Assign to..."
                                value={formData.assignedTo || ''}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            >
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </Select>
                            {editMode && (
                                <Select
                                    name="status"
                                    placeholder="Select status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="converted">Converted</option>
                                    <option value="rejected">Rejected</option>
                                </Select>
                            )}

                            {/* Notes while creating */}
                            {!editMode && (
                                <Textarea
                                    name="notes"
                                    placeholder="Add initial notes..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            )}

                            {/* Existing notes in edit */}
                            {editMode && selectedEnquiry?.notes?.length > 0 && (
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Existing Notes:</Text>
                                    {selectedEnquiry.notes.map((note, i) => (
                                        <Box key={i} p={2} mb={1} borderWidth="1px" borderRadius="md">
                                            {note.text}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* New notes to add in edit */}
                            {editMode && (
                                <Box>
                                    <Button
                                        leftIcon={<MdAdd />}
                                        size="sm"
                                        colorScheme="green"
                                        mb={2}
                                        onClick={addNoteField}
                                    >
                                        Add Note
                                    </Button>
                                    {newNotes.map((note, index) => (
                                        <Stack direction="row" align="center" key={index} mb={2}>
                                            <Textarea
                                                placeholder={`New Note ${index + 1}`}
                                                value={note}
                                                onChange={(e) => handleNoteChange(index, e.target.value)}
                                            />
                                            <IconButton
                                                icon={<MdRemoveCircleOutline />}
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => removeNoteField(index)}
                                            />
                                        </Stack>
                                    ))}
                                </Box>
                            )}
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            {editMode ? 'Save Changes' : 'Add Enquiry'}
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

export default Enquiry;
