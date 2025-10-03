import { useEffect, useMemo, useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Table, TableContainer, Tbody, Td, Text, Thead, Th, Tr, useDisclosure, SimpleGrid } from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import { getApprovedRequests, getMyChildren, createOrder, getAllProducts, getAllStocks, getMyOrders } from "../actions/crm-leadsActions";
import { allowDigitsOnly, allowPrice, allowAlphaSpaces, allowEmailChars, collectErrors, isNonEmpty, isPositiveInteger, isNonNegativeNumber, isValidEmail } from "../utils/validators";
import { getMe } from "../actions/userActions";
import SectionTabs from "../components/SectionTabs";

const OrderPage = () => {
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [children, setChildren] = useState([]);
    const [products, setProducts] = useState([]);
    const [myStocks, setMyStocks] = useState([]);
    const [orders, setOrders] = useState([]);

    const [roles, setRoles] = useState([]);
    const isDealer = Array.isArray(roles) && roles.includes('dealer');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [form, setForm] = useState({
        receiverType: "partner",
        receiverId: "",
        finalPrice: "",
        productId: "",
        quantity: "",
        formData: {
            name: "",
            mobile: "",
            email: "",
            location: "",
            company: "",
            notes: "",
        },
    });

    const openCreateOrder = () => {
        setSelectedRequest(null);
        setForm({
            receiverType: isDealer ? "enduser" : "partner",
            receiverId: "",
            finalPrice: "",
            productId: "",
            quantity: "",
            formData: {
                name: "",
                mobile: "",
                email: "",
                location: "",
                company: "",
                notes: "",
            },
        });
        setActiveModal("Create Order");
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        onClose();
    };

    const fetchApproved = async () => {
        try {
            const res = await getApprovedRequests();
            setApprovedRequests(res?.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchChildren = async () => {
        try {
            const res = await getMyChildren();
            setChildren(res?.data?.data || []);
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        try {
            const res = await getAllProducts();
            setProducts(res?.products || []);
        } catch (e) { console.error(e); }
    };
    const fetchStocks = async () => {
        try {
            const res = await getAllStocks();
            setMyStocks(res?.stocks || []);
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            const res = await getMyOrders();
            setOrders(res?.data || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const me = await getMe();
                const fetched = me?.data?.role;
                if (Array.isArray(fetched)) {
                    setRoles(fetched);
                    return;
                }
            } catch (e) {
                // ignore
            }
            const stored = JSON.parse(localStorage.getItem("userRole")) || [];
            setRoles(Array.isArray(stored) ? stored : []);
        };
        loadRoles();
        fetchApproved();
        fetchChildren();
        fetchProducts();
        fetchStocks();
        fetchOrders();
    }, []);

    const childOptions = useMemo(() => children.map(c => ({ value: c._id, label: `${c.name} (${c.email})` })), [children]);
    const uniqueStockProducts = useMemo(() => {
        const seen = new Set();
        const list = [];
        for (const s of myStocks) {
            const id = typeof s.productId === 'object' ? s.productId?._id : s.productId;
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const name = typeof s.productId === 'object' && s.productId?.productName
                ? s.productId.productName
                : (products.find(p => p._id === id)?.productName || id);
            list.push({ value: id, label: name });
        }
        return list;
    }, [myStocks, products]);

    const partnerLabel = useMemo(() => {
        if (Array.isArray(roles)) {
            if (roles.includes('stockist')) return 'distributor';
            if (roles.includes('distributor')) return 'dealer';
        }
        return 'partner';
    }, [roles]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFormDataChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, formData: { ...prev.formData, [name]: value } }));
    };

    const submitOrder = async () => {
        try {
            const productId = form.productId || (selectedRequest && (selectedRequest.productId?._id || selectedRequest.productId));
            const quantityStr = form.quantity || (selectedRequest ? String(selectedRequest.quantity) : "");
            const errors = collectErrors([
                { valid: isNonEmpty(productId), message: 'Select product' },
                { valid: isPositiveInteger(quantityStr), message: 'Enter valid quantity' },
                { valid: form.finalPrice === '' || isNonNegativeNumber(form.finalPrice), message: 'Enter valid final price' },
            ]);
            if (errors.length) { toast.error(errors[0]); return; }
            const quantity = Number(quantityStr);
            // Validate end-user details when receiverType is enduser
            if (form.receiverType === 'enduser') {
                const { name, mobile, email, location } = form.formData || {};
                const endUserErrors = collectErrors([
                    { valid: isNonEmpty(name), message: 'Enter end user name' },
                    { valid: isNonEmpty(mobile), message: 'Enter mobile' },
                    { valid: isValidEmail(email), message: 'Enter valid email' },
                    { valid: isNonEmpty(location), message: 'Enter location' },
                ]);
                if (endUserErrors.length) { toast.error(endUserErrors[0]); return; }
            }
            const payload = {
                productId,
                quantity,
                finalPrice: Number(form.finalPrice || 0),
                requestedBy: form.receiverType === 'partner' ? form.receiverId : undefined,
                fulfilledBy: undefined,
                formData: form.receiverType === 'enduser' ? form.formData : undefined,
            };
            // lead flow later
            await createOrder(payload);
            toast.success("Order created");
            closeModal();
            fetchOrders(); // Refresh orders list
        } catch (e) {
            console.error(e);
            toast.error("Failed to create order");
        }
    };

    const getProductName = (req) => {
        if (typeof req.productId === 'object' && req.productId?.productName) return req.productId.productName;
        const found = products.find(p => p._id === req.productId);
        return found?.productName || "-";
    };

    return (
        <Box p={8} mx={20} display="flex" flexDirection="column">
            <ToastContainer />
            <Box mt={4} mb={2}>
                <Text fontSize="4xl" fontWeight="700" textAlign="left">
                    Orders
                </Text>
            </Box>

            {/* Action Buttons */}
            <Stack direction={['column', 'row']} align="center" spacing={4} mb={4} mt={2}>
                <Button onClick={openCreateOrder} colorScheme="green" variant="outline" size="md">
                    Create Order
                </Button>
            </Stack>

            <SectionTabs
                tabs={[
                    {
                        label: "My Orders",
                        content: (
                            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                                <Table>
                                    <Thead bg="gray.100">
                                        <Tr>
                                            <Th>Sr.No.</Th>
                                            <Th>Product</Th>
                                            <Th>Quantity</Th>
                                            <Th>Final Price</Th>
                                            <Th>Sent To</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {orders.map((order, idx) => (
                                            <Tr key={order._id}>
                                                <Td>{idx + 1}</Td>
                                                <Td>{getProductName(order)}</Td>
                                                <Td>{order.quantity}</Td>
                                                <Td>₹{order.finalPrice}</Td>
                                                <Td>
                                                    {order.requestedBy?.name || order.requestedBy?.email || 'End User'}
                                                </Td>
                                                <Td>{order.status}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )
                    },
                    {
                        label: "Approved requests",
                        content: (
                            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                                <Table>
                                    <Thead bg="gray.100">
                                        <Tr>
                                            <Th>Sr.No.</Th>
                                            <Th>Product</Th>
                                            <Th>Quantity</Th>
                                            <Th>To</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {approvedRequests.map((req, idx) => (
                                            <Tr key={req._id}>
                                                <Td>{idx + 1}</Td>
                                                <Td>{getProductName(req)}</Td>
                                                <Td>{req.quantity}</Td>
                                                <Td>{req.requestedBy.name}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )
                    }
                ]}
            />

            <Modal isOpen={isOpen && activeModal === "Create Order"} onClose={closeModal} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Order</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid columns={form.receiverType === 'enduser' ? [1, 2] : [1]} spacing={5} alignItems="start">
                            <Stack spacing={3}>
                                <FormControl>
                                    <FormLabel>Product</FormLabel>
                                    <Select name="productId" value={form.productId} onChange={handleFormChange} placeholder="Select product from your stock">
                                        {uniqueStockProducts.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Quantity</FormLabel>
                                    <Input name="quantity" value={form.quantity} onChange={handleFormChange} onKeyDown={allowDigitsOnly} placeholder="Enter quantity" />
                                </FormControl>
                                {null}
                                {form.receiverType === 'partner' && !isDealer && (
                                    <FormControl>
                                        <FormLabel>Select Receiver</FormLabel>
                                        <Select name="receiverId" value={form.receiverId} onChange={handleFormChange} placeholder={`Select ${partnerLabel}`}>
                                            {childOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                                <FormControl>
                                    <FormLabel>Final Price</FormLabel>
                                    <Input name="finalPrice" value={form.finalPrice} onChange={handleFormChange} onKeyDown={(e) => allowPrice(e, form.finalPrice)} placeholder="Enter final price" />
                                </FormControl>
                            </Stack>
                            {form.receiverType === 'enduser' && (
                                <Stack spacing={3}>
                                    <FormControl>
                                        <FormLabel>End User Name</FormLabel>
                                        <Input name="name" value={form.formData.name} onChange={handleFormDataChange} onKeyDown={allowAlphaSpaces} placeholder="Enter name" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Mobile</FormLabel>
                                        <Input name="mobile" value={form.formData.mobile} onChange={handleFormDataChange} onKeyDown={allowDigitsOnly} placeholder="Enter mobile" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Email</FormLabel>
                                        <Input name="email" value={form.formData.email} onChange={handleFormDataChange} onKeyDown={allowEmailChars} placeholder="Enter email" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Location</FormLabel>
                                        <Input name="location" value={form.formData.location} onChange={handleFormDataChange} placeholder="Enter location" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Company (optional)</FormLabel>
                                        <Input name="company" value={form.formData.company} onChange={handleFormDataChange} placeholder="Enter company" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Notes (optional)</FormLabel>
                                        <Input name="notes" value={form.formData.notes} onChange={handleFormDataChange} placeholder="Any notes" />
                                    </FormControl>
                                </Stack>
                            )}
                        </SimpleGrid>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={submitOrder}
                            isDisabled={
                                (form.receiverType === 'partner' && !form.receiverId) ||
                                (form.receiverType === 'enduser' && (!form.formData.name || !form.formData.mobile || !form.formData.email || !form.formData.location))
                            }
                        >
                            Create
                        </Button>
                        <Button onClick={closeModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrderPage;


