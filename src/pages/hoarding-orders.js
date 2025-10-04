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
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    Divider,
} from '@chakra-ui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd } from 'react-icons/md';

import {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    getUserForOrder,
} from '../actions/hoardingsActions';
import { getAllCustomers } from '../actions/hoardingsActions';
import { getAllHoardings } from '../actions/hoardingsActions';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [hoardings, setHoardings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    // View Modal
    const {
        isOpen: isViewOpen,
        onOpen: onViewOpen,
        onClose: onViewClose,
    } = useDisclosure();

    // Edit Modal
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [formData, setFormData] = useState({
        customer: '',
        hoardingDetails: [],
        bookingStartDate: '',
        bookingEndDate: '',
        subtotal: 0,
        discount: 0,
        totalAmount: 0,
        salesPerson:'',
        status: '',
        notes: '',
    });

    // ================= FETCH DATA =================
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const ordersRes = await getAllOrders();
            const customersRes = await getAllCustomers();
            const hoardingsRes = await getAllHoardings();
            const users = await getUserForOrder();
            // console.log('users', users);
            setOrders(ordersRes);
            setCustomers(customersRes);
            setHoardings(hoardingsRes.data);
        } catch (error) {
            toast.error(error?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // ================= FORM HANDLERS =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleHoardingSelect = (index, field, value) => {
        const updated = [...formData.hoardingDetails];
        updated[index][field] = value;

        if (field === 'hoardingId') {
            const selected = hoardings.find((h) => h._id === value);
            if (selected) {
                updated[index].pricePerMonth = selected.pricePerMonth || 0;
            }
        }

        setFormData((prev) => ({ ...prev, hoardingDetails: updated }));
        calculateTotals(updated, formData.discount);
    };

    const handleAddHoarding = () => {
        setFormData((prev) => ({
            ...prev,
            hoardingDetails: [
                ...prev.hoardingDetails,
                { hoardingId: '', pricePerMonth: 0, totalMonths: 1, totalAmount: 0 },
            ],
        }));
    };

    const handleRemoveHoarding = (index) => {
        const updated = formData.hoardingDetails.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, hoardingDetails: updated }));
        calculateTotals(updated, formData.discount);
    };

    const handleDiscountChange = (e) => {
        const discount = Number(e.target.value) || 0;
        setFormData((prev) => ({ ...prev, discount }));
        calculateTotals(formData.hoardingDetails, discount);
    };

    const calculateTotals = (hoardingDetails, discount) => {
        const subtotal = hoardingDetails.reduce((acc, item) => {
            const total =
                (Number(item.pricePerMonth) || 0) * (Number(item.totalMonths) || 1);
            return acc + total;
        }, 0);
        setFormData((prev) => ({
            ...prev,
            subtotal,
            totalAmount: subtotal - discount,
        }));
    };

    // ================= CRUD HANDLERS =================
    const handleSubmit = async () => {
        if (!formData.customer || formData.hoardingDetails.length === 0) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const payload = { ...formData };
            await createOrder(payload);
            toast.success('Order created successfully');
            onClose();
            fetchInitialData();
        } catch (error) {
            toast.error(error?.message || 'Failed to create order');
        }
    };

    const handleView = async (id) => {
        try {
            const data = await getOrderById(id);
            console.log('data', data);
            setSelectedOrder(data);
            onViewOpen();
        } catch (error) {
            toast.error(error?.message || 'Failed to fetch order');
        }
    };

    const handleEdit = (order) => {
        setSelectedOrder({ ...order, newNote: '' });
        onEditOpen();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await deleteOrder(id);
            toast.success('Order deleted successfully');
            fetchInitialData();
        } catch (error) {
            toast.error(error?.message || 'Failed to delete order');
        }
    };

    const handleUpdateOrder = async () => {
        try {
            await updateOrder(selectedOrder._id, {
                status: selectedOrder.status,
                notes: selectedOrder.newNote,
            });
            toast.success('Order updated successfully');
            onEditClose();
            fetchInitialData();
        } catch (error) {
            toast.error(error?.message || 'Failed to update order');
        }
    };

    return (
        <Box p={8} mx={20} display={'flex'} flexDirection={'column'}>
            <ToastContainer />
            <Box mt={4} mb={2}>
                <Text
                    sx={{
                        color: 'var(--primary-txt, #141E35)',
                        fontFamily: 'Inter',
                        fontSize: '4xl',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        textAlign: 'left',
                    }}
                >
                    Orders
                </Text>
            </Box>

            <Stack direction="row" justify="space-between" mb={4}>
                <Button onClick={onOpen} colorScheme="green" variant="outline" size="md">
                    + Create Order
                </Button>
            </Stack>

            {/* Orders Table */}
            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                <Table>
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Sr.No.</Th>
                            <Th>Customer</Th>
                            <Th>Hoardings</Th>
                            <Th>Subtotal</Th>
                            <Th>Total</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center">
                                    <CircularProgress isIndeterminate color="green.400" />
                                </Td>
                            </Tr>
                        ) : (
                            orders?.map((order, index) => (
                                <Tr key={order._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{order?.customer?.name || '—'}</Td>
                                    <Td>{order?.hoardings?.length}</Td>
                                    <Td>₹{order?.subtotal}</Td>
                                    <Td>₹{order?.totalAmount}</Td>
                                    <Td>{order?.status}</Td>
                                    <Td>
                                        <Stack direction="row" spacing={2}>
                                            <Button size="sm" colorScheme="blue" onClick={() => handleView(order._id)}>
                                                View
                                            </Button>
                                            <Button size="sm" colorScheme="yellow" onClick={() => handleEdit(order)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" colorScheme="red" onClick={() => handleDelete(order._id)}>
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

            {/* Create Order Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Order</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <FormControl>
                                <FormLabel>Customer</FormLabel>
                                <Select
                                    name="customer"
                                    value={formData?.customer}
                                    onChange={handleChange}
                                    placeholder="Select Customer"
                                >
                                    {customers?.map((cust) => (
                                        <option key={cust._id} value={cust._id}>
                                            {cust.name} ({cust.mobile})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider />

                            <Text fontWeight="bold">Hoardings Details</Text>
                            {formData.hoardingDetails.map((item, index) => (
                                <Box key={index} p={3} borderWidth="1px" borderRadius="md" mb={3}>
                                    <Stack spacing={3}>
                                        <FormControl>
                                            <FormLabel>Hoarding</FormLabel>
                                            <Select
                                                value={item.hoardingId}
                                                onChange={(e) =>
                                                    handleHoardingSelect(index, 'hoardingId', e.target.value)
                                                }
                                                placeholder="Select Hoarding"
                                            >
                                                {hoardings.map((h) => (
                                                    <option key={h._id} value={h._id}>
                                                        {h.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Price per Month</FormLabel>
                                            <NumberInput
                                                value={item.pricePerMonth}
                                                onChange={(val) =>
                                                    handleHoardingSelect(index, 'pricePerMonth', val)
                                                }
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Total Months</FormLabel>
                                            <NumberInput
                                                value={item.totalMonths}
                                                onChange={(val) =>
                                                    handleHoardingSelect(index, 'totalMonths', val)
                                                }
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                        </FormControl>

                                        <Button
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => handleRemoveHoarding(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Stack>
                                </Box>
                            ))}

                            <Button
                                leftIcon={<MdAdd />}
                                onClick={handleAddHoarding}
                                colorScheme="blue"
                                variant="outline"
                                size="sm"
                            >
                                Add Hoarding
                            </Button>

                            <Divider />

                            <FormControl>
                                <FormLabel>Booking Start Date</FormLabel>
                                <Input
                                    type="date"
                                    name="bookingStartDate"
                                    value={formData.bookingStartDate}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Booking End Date</FormLabel>
                                <Input
                                    type="date"
                                    name="bookingEndDate"
                                    value={formData.bookingEndDate}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Subtotal</FormLabel>
                                <Input value={formData.subtotal} isReadOnly />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Discount</FormLabel>
                                <NumberInput
                                    value={formData.discount}
                                    onChange={(val) => handleDiscountChange({ target: { value: val } })}
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Total Amount</FormLabel>
                                <Input value={formData.totalAmount} isReadOnly />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Input
                                    name="notes"
                                    placeholder="Add any important notes..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Create Order
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Details Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Order Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder ? (
                            <Stack spacing={4}>
                                <Box>
                                    <Text fontWeight="bold">Customer</Text>
                                    <Text>
                                        {selectedOrder.customer?.name} (
                                        {selectedOrder.customer?.mobile})
                                    </Text>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Booking Dates</Text>
                                    <Text>
                                        {new Date(
                                            selectedOrder.bookingStartDate
                                        ).toLocaleDateString()}{' '}
                                        →{' '}
                                        {new Date(
                                            selectedOrder.bookingEndDate
                                        ).toLocaleDateString()}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Hoardings</Text>
                                    {selectedOrder.orderHoardings.map((oh) => (
                                        <Box
                                            key={oh._id}
                                            borderWidth="1px"
                                            p={2}
                                            borderRadius="md"
                                            mb={2}
                                        >
                                            <Text>
                                                <strong>{oh.hoarding?.name}</strong> —{' '}
                                                {oh.hoarding?.location}
                                            </Text>
                                            <Text>
                                                Price/month: ₹{oh.finalPricePerMonth} ×{' '}
                                                {oh.totalMonths} = ₹{oh.totalAmount}
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Financials</Text>
                                    <Text>Subtotal: ₹{selectedOrder.subtotal}</Text>
                                    <Text>Discount: ₹{selectedOrder.discount}</Text>
                                    <Text>Total: ₹{selectedOrder.totalAmount}</Text>
                                </Box>

                                {selectedOrder.notes?.length > 0 && (
                                    <Box>
                                        <Text fontWeight="bold">Notes</Text>
                                        {selectedOrder.notes.map((n, i) => (
                                            <Text key={i}>• {n.text}</Text>
                                        ))}
                                    </Box>
                                )}
                            </Stack>
                        ) : (
                            <Text>Loading...</Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Order</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <Stack spacing={3}>
                                <FormControl>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        value={selectedOrder.status}
                                        onChange={(e) =>
                                            setSelectedOrder((prev) => ({
                                                ...prev,
                                                status: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Add Note</FormLabel>
                                    <Input
                                        placeholder="Write a note..."
                                        value={selectedOrder.newNote || ''}
                                        onChange={(e) =>
                                            setSelectedOrder((prev) => ({
                                                ...prev,
                                                newNote: e.target.value,
                                            }))
                                        }
                                    />
                                </FormControl>
                            </Stack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleUpdateOrder}>
                            Save
                        </Button>
                        <Button variant="outline" onClick={onEditClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Orders;
