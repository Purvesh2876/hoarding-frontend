// pages/Requests.js
import { useState, useEffect, useMemo } from "react";
import {
    Box, Button, FormControl, FormLabel,
    Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure,
    Textarea, ModalCloseButton,
} from "@chakra-ui/react";
import { toast, ToastContainer } from "react-toastify";
import { allowDigitsOnly, collectErrors, isPositiveInteger, isNonEmpty } from "../utils/validators";
import SectionTabs from "../components/SectionTabs";
import { getMe } from "../actions/userActions";

import {
    getAllProducts,
    getAllRequests,
    getMyRequests,
    getParentStocks,
    createRequest,
    updateRequest,
    deleteRequest,
} from "../actions/crm-leadsActions";

const Requests = () => {
    const [requests, setRequests] = useState([]); // pending requests assigned to me
    const [myRequests, setMyRequests] = useState([]); // requests I created
    const [products, setProducts] = useState([]);
    const [parentStocks, setParentStocks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [filteredMyRequests, setFilteredMyRequests] = useState([]);
    const [filteredParentStocks, setFilteredParentStocks] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Add form state
    const [addForm, setAddForm] = useState({
        productId: "",
        quantity: "",
        remarks: "",
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        productId: "",
        quantity: "",
        remarks: "",
        status: "",
    });

    const [requestIdToDelete, setRequestIdToDelete] = useState(null);

    const [roles, setRoles] = useState(null);
    const [parentId, setParentId] = useState(null);
    const isStockist = Array.isArray(roles) && roles.includes('stockist');
    const isDealer = Array.isArray(roles) && roles.includes('dealer');
    const isAdmin = Array.isArray(roles) && roles.includes('admin');
    // const canEditDelete = Array.isArray(roles) && (roles.includes("distributor") || roles.includes("admin"));

    // Fetch requests
    const fetchRequests = async () => {
        try {
            const response = await getAllRequests();
            const requestsData = (response?.data || []);
            setRequests(requestsData);
            setFilteredRequests(requestsData);
        } catch (e) {
            console.error("Error fetching requests:", e);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const response = await getMyRequests();
            const requestsData = (response?.data || []).filter(r => r.status !== 'approved');
            setMyRequests(requestsData);
            setFilteredMyRequests(requestsData);
        } catch (e) {
            console.error("Error fetching my requests:", e);
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchParentStocks = async () => {
        try {
            const response = await getParentStocks(1, 100);
            const stocks = response?.data?.stocks || [];
            setParentStocks(stocks);
            setFilteredParentStocks(stocks);
        } catch (error) {
            console.error("Error fetching parent stocks:", error);
        }
    };

    // Search functionality
    const handleSearch = () => {
        if (searchTerm.trim() === "") {
            setFilteredRequests(requests);
            setFilteredMyRequests(myRequests);
            setFilteredParentStocks(parentStocks);
        } else {
            const filtered = requests.filter((req) => {
                // Check if productId is populated (object) or just ID (string)
                const productName = typeof req.productId === 'object' && req.productId?.productName
                    ? req.productId.productName
                    : products.find((p) => p._id === req.productId)?.productName || "";
                return productName.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredRequests(filtered);
            const filteredMine = myRequests.filter((req) => {
                const productName = typeof req.productId === 'object' && req.productId?.productName
                    ? req.productId.productName
                    : products.find((p) => p._id === req.productId)?.productName || "";
                return productName.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredMyRequests(filteredMine);
            const filteredStocks = parentStocks.filter((stk) => {
                const productName = typeof stk.productId === 'object' && stk.productId?.productName
                    ? stk.productId.productName
                    : products.find((p) => p._id === stk.productId)?.productName || "";
                return productName.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredParentStocks(filteredStocks);
        }
    };

    // Filter requests when search term changes
    useEffect(() => {
        handleSearch();
    }, [searchTerm, requests, myRequests, parentStocks, products]);

    useEffect(() => {
        // Load roles from API (preferred) with localStorage fallback
        const loadRoles = async () => {
            try {
                const me = await getMe();
                const fetched = me?.data?.role;
                const pId = me?.data?.parentId || null;
                setParentId(pId);
                if (Array.isArray(fetched)) {
                    setRoles(fetched);
                    return;
                }
            } catch (e) {
                // ignore and fallback
            }
            const stored = JSON.parse(localStorage.getItem("userRole")) || [];
            setRoles(Array.isArray(stored) ? stored : []);
        };
        loadRoles();
        fetchRequests();
        fetchMyRequests();
        fetchProducts();
    }, []);

    // Fetch parent stocks only for non-admin users once roles are loaded
    useEffect(() => {
        if (Array.isArray(roles) && roles.length > 0 && !roles.includes('admin') && parentId) {
            fetchParentStocks();
        }
    }, [roles, parentId]);

    // Products allowed for request creation: show all products for everyone
    const requestableProducts = useMemo(() => products || [], [products]);

    // Handle add form changes
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle edit form changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    // Create Request
    const handleRequestSubmit = async () => {
        try {
            const errors = collectErrors([
                { valid: isNonEmpty(addForm.productId), message: 'Select a product' },
                { valid: isPositiveInteger(addForm.quantity), message: 'Enter a valid quantity' },
            ]);
            if (errors.length) {
                toast.error(errors[0]);
                return;
            }
            await createRequest({ ...addForm, status: "pending" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            closeModal();
            toast.success("Request created successfully");
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error("Failed to create request");
        }
    };

    // Edit Request
    const handleEditSubmit = async () => {
        try {
            const errors = collectErrors([
                { valid: isNonEmpty(editForm.productId), message: 'Select a product' },
                { valid: isPositiveInteger(editForm.quantity), message: 'Enter a valid quantity' },
                { valid: isNonEmpty(editForm.status), message: 'Select status' },
            ]);
            if (errors.length) {
                toast.error(errors[0]);
                return;
            }
            await updateRequest({ id: selectedRequest._id, ...editForm });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            closeModal();
            toast.success("Request updated successfully");
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error("Failed to update request");
        }
    };

    // Delete Request
    const confirmDelete = async () => {
        try {
            await deleteRequest({ id: requestIdToDelete });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            closeModal();
            toast.success("Request deleted successfully");
        } catch (error) {
            console.error("Error deleting request:", error);
            toast.error("Failed to delete request");
        }
    };

    // Approve/Reject/Cancel actions
    const handleApprove = async (request) => {
        try {
            await updateRequest({ id: request._id, status: "approved" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            toast.success("Request approved");
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error("Failed to approve request");
        }
    };

    const handleReject = async (request) => {
        try {
            await updateRequest({ id: request._id, status: "rejected" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            toast.success("Request rejected");
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject request");
        }
    };

    const handleCancel = async (request) => {
        try {
            await updateRequest({ id: request._id, status: "cancelled" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            toast.success("Request cancelled");
        } catch (error) {
            console.error("Error cancelling request:", error);
            toast.error("Failed to cancel request");
        }
    };

    const handleFulfill = async (request) => {
        try {
            await updateRequest({ id: request._id, status: "fulfilled" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            toast.success("Request marked as fulfilled");
        } catch (error) {
            console.error("Error fulfilling request:", error);
            toast.error("Failed to mark as fulfilled");
        }
    };

    const handleRerequest = async (request) => {
        try {
            await updateRequest({ id: request._id, status: "requested" });
            await Promise.all([fetchRequests(), fetchMyRequests()]);
            toast.success("Request re-submitted");
        } catch (error) {
            console.error("Error re-requesting:", error);
            toast.error("Failed to re-request");
        }
    };

    // Open modals
    const openAddModal = () => {
        setActiveModal("Create Request");
        setAddForm({ productId: "", quantity: "", remarks: "" });
        onOpen();
    };

    const openEditModal = (request) => {
        setActiveModal("Edit Request");
        setSelectedRequest(request);
        // Handle both populated and non-populated productId
        const productId = typeof request.productId === 'object' ? request.productId._id : request.productId;
        setEditForm({
            productId: productId,
            quantity: request.quantity,
            remarks: request.remarks,
            status: request.status,
        });
        onOpen();
    };

    const openDeleteModal = (id) => {
        setActiveModal("Delete Request");
        setRequestIdToDelete(id);
        onOpen();
    };

    const closeModal = () => {
        setActiveModal(null);
        onClose();
    };

    return (
        <Box p={8} mx={20} display="flex" flexDirection="column">
            <ToastContainer />

            {/* Page Header */}
            <Box mt={4} mb={2}>
                <Text fontSize="4xl" fontWeight="700" textAlign="left">
                    Requests
                </Text>
            </Box>

            {/* Search and Action Buttons */}
            <Stack direction={['column', 'row']} align="center" spacing={4} mb={4}>
                <Stack direction={['column', 'row']} align="center" spacing={4}>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by product name"
                        size="md"
                        maxWidth="300px"
                        focusBorderColor="green.400"
                        _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                    />
                    <Button onClick={handleSearch} colorScheme='blue' variant='outline' size='md'>
                        Search
                    </Button>
                </Stack>
                <Button onClick={openAddModal} colorScheme="green" variant="outline" size="md">
                    Create Request
                </Button>
            </Stack>

            <SectionTabs
                tabs={[
                    // Hide "Pending requests" entirely for dealer
                    ...(!isDealer ? [{
                        label: "Pending requests",
                        content: (
                            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                                <Table>
                                    <Thead bg="gray.100">
                                        <Tr>
                                            <Th>Sr.No.</Th>
                                            <Th>Product</Th>
                                            <Th>Quantity</Th>
                                            <Th>Remarks</Th>
                                            <Th>Status</Th>
                                            <Th pl={0}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredRequests.map((req, index) => {
                                            const productName = typeof req.productId === 'object' && req.productId?.productName
                                                ? req.productId.productName
                                                : products.find((p) => p._id === req.productId)?.productName || "-";
                                            return (
                                                <Tr key={req._id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>{productName}</Td>
                                                    <Td>{req.quantity}</Td>
                                                    <Td>{req.remarks}</Td>
                                                    <Td>{req.status}</Td>

                                                    <Td padding={0} w={'fit-content'} >
                                                        {(req.status === 'pending' || req.status === 'requested') && (
                                                            <>
                                                                <Button variant="outline" colorScheme="green" onClick={() => handleApprove(req)}>
                                                                    Approve
                                                                </Button>
                                                                <Button variant="outline" colorScheme="red" onClick={() => handleReject(req)}>
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {req.status === 'approved' && (
                                                            <Button size="sm" variant="outline" colorScheme="purple" onClick={() => handleFulfill(req)}>
                                                                Fulfilled
                                                            </Button>
                                                        )}
                                                        {(req.status === 'rejected' || req.status === 'cancelled' || req.status === 'fulfilled') && (
                                                            <Box visibility="hidden" aria-hidden="true">.</Box>
                                                        )}
                                                    </Td>

                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )
                    }] : []),
                    // Hide "My requests" for admin only (stockist can see)
                    ...(!isAdmin ? [{
                        label: "My requests",
                        content: (
                            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                                <Table>
                                    <Thead bg="gray.100">
                                        <Tr>
                                            <Th>Sr.No.</Th>
                                            <Th>Product</Th>
                                            <Th>Quantity</Th>
                                            <Th>Remarks</Th>
                                            <Th>Status</Th>
                                            <Th pl={0}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredMyRequests.map((req, index) => {
                                            const productName = typeof req.productId === 'object' && req.productId?.productName
                                                ? req.productId.productName
                                                : products.find((p) => p._id === req.productId)?.productName || "-";
                                            return (
                                                <Tr key={req._id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>{productName}</Td>
                                                    <Td>{req.quantity}</Td>
                                                    <Td>{req.remarks}</Td>
                                                    <Td>{req.status}</Td>
                                                    <Td padding={0} w={'fit-content'}>
                                                        {(req.status === 'pending' || req.status === 'requested') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="red"
                                                                onClick={() => handleCancel(req)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        {req.status === 'rejected' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                colorScheme="blue"
                                                                onClick={() => handleRerequest(req)}
                                                            >
                                                                Rerequest
                                                            </Button>
                                                        )}
                                                        {(req.status !== 'pending' &&
                                                            req.status !== 'requested' &&
                                                            req.status !== 'rejected') && (
                                                                <Box visibility="hidden" aria-hidden="true">
                                                                    .
                                                                </Box>
                                                            )}
                                                    </Td>

                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )
                    }] : []),
                    // Hide "Parent stock" for admin only (stockist can see)
                    ...(!isAdmin ? [{
                        label: "Parent stock",
                        content: (
                            <TableContainer boxShadow="0px 5px 22px 0px rgba(0, 0, 0, 0.04)" borderRadius="md">
                                <Table>
                                    <Thead bg="gray.100">
                                        <Tr>
                                            <Th>Sr.No.</Th>
                                            <Th>Product</Th>
                                            <Th isNumeric>Quantity</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredParentStocks.map((stk, index) => {
                                            const productName = typeof stk.productId === 'object' && stk.productId?.productName
                                                ? stk.productId.productName
                                                : products.find((p) => p._id === stk.productId)?.productName || "-";
                                            return (
                                                <Tr key={stk._id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>{productName}</Td>
                                                    <Td isNumeric>{stk.quantity}</Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )
                    }] : [])
                ]}
            />

            {/* Add Request Modal */}
            <Modal isOpen={isOpen && activeModal === "Create Request"} onClose={closeModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Request</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <FormControl>
                                <FormLabel>Product</FormLabel>
                                <Select
                                    placeholder="Select Product"
                                    name="productId"
                                    value={addForm.productId}
                                    onChange={handleAddFormChange}
                                >
                                    {requestableProducts.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.productName}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Quantity</FormLabel>
                                <Input
                                    placeholder="Quantity"
                                    name="quantity"
                                    value={addForm.quantity}
                                    onChange={handleAddFormChange}
                                    onKeyDown={allowDigitsOnly}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Remarks</FormLabel>
                                <Textarea
                                    placeholder="Remarks"
                                    name="remarks"
                                    value={addForm.remarks}
                                    onChange={handleAddFormChange}
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleRequestSubmit}>
                            Submit
                        </Button>
                        <Button onClick={closeModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Request Modal */}
            <Modal isOpen={isOpen && activeModal === "Edit Request"} onClose={closeModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Request</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <FormControl>
                                <FormLabel>Product</FormLabel>
                                <Select
                                    name="productId"
                                    value={editForm.productId}
                                    onChange={handleEditFormChange}
                                >
                                    {requestableProducts.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.productName}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Quantity</FormLabel>
                                <Input
                                    name="quantity"
                                    value={editForm.quantity}
                                    onChange={handleEditFormChange}
                                    onKeyDown={allowDigitsOnly}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Remarks</FormLabel>
                                <Textarea
                                    name="remarks"
                                    value={editForm.remarks}
                                    onChange={handleEditFormChange}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select name="status" value={editForm.status} onChange={handleEditFormChange}>
                                    <option value="requested">Requested</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="fulfilled">Fulfilled</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleEditSubmit}>
                            Save
                        </Button>
                        <Button onClick={closeModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Request Modal */}
            <Modal isOpen={isOpen && activeModal === "Delete Request"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>Are you sure you want to delete this request?</ModalBody>
                    <ModalFooter>
                        <Button onClick={closeModal}>Cancel</Button>
                        <Button colorScheme="red" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Requests;
