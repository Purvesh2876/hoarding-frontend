// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import SessionTimeout from './SessionTimeout';
import {
    Box, Button, Checkbox, CheckboxGroup, CircularProgress, FormControl, FormLabel,
    Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, List, ListItem,
    Textarea,
    Flex,
    ModalCloseButton,
    Divider,
    Badge,
    SimpleGrid
} from '@chakra-ui/react';
import { toast, ToastContainer } from 'react-toastify';
import { MdAdd } from 'react-icons/md';
import { deleteEmsUser, getAllEmsUsers } from '../actions/adminActions';
import { getUsersByRole, getMyChildren } from '../actions/userActions';
import { bulkUploadLeads, createLead, deleteLead, getAllLeads, getAllStocks, updateLead } from '../actions/crm-leadsActions';
import { BsEye } from 'react-icons/bs';
import * as XLSX from "xlsx";
import { allowAlphaSpaces, allowDigitsOnly, allowEmailChars, allowPrice, collectErrors, isNonEmpty, isPositiveInteger, isNonNegativeNumber, isValidEmail } from '../utils/validators';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [email, setEmail] = useState('')
    const [page, setPage] = useState(1);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);;

    const [editableUserId, setEditableUserId] = useState(null);
    const [roleOptions] = useState(["view", "admin", "user", "Godown"]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    // const [selectedReqId, setSelectedReqId] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const userRoles = JSON.parse(localStorage.getItem("userRole")) || [];
    const isAdmin = userRoles.includes("admin");
    const isSales = userRoles.includes("sales");
    const isMarketing = userRoles.includes("marketing");
    const isMarketingLead = userRoles.includes("marketing-lead");
    const isPrivileged = isAdmin || isSales || isMarketing || isMarketingLead;
    const canEditDelete = userRoles.includes("itsupport") || isPrivileged;
    const [formData, setFormData] = useState({}); // For editable fields
    const [requirements, setRequirements] = useState([]);
    const [jsonData, setJsonData] = useState([]);
    const [entryType, setEntryType] = useState("manual"); // or "excel"
    const [assignableUsers, setAssignableUsers] = useState([]);
    const [manualData, setManualData] = useState({
        name: "",
        mobile: "",
        email: "",
        company: "",
        location: "",
        industryType: "",
        customerType: "",
    });

    const handleRequirementChange = (index, field, value) => {
        const updated = [...requirements];
        updated[index][field] = value;
        setRequirements(updated);
    };

    const handleAddRequirement = () => {
        setRequirements([...requirements, { cameraType: "", quantity: "", orderTimeline: "" }]);
    };

    const handleRemoveRequirement = (index) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };


    const fetchAssignableUsers = async () => {
        try {
            // Admin/Marketing/Sales → show Stockists
            if (isPrivileged) {
                const res = await getUsersByRole('stockist');
                if (res?.success) setAssignableUsers(res.data || []);
                else setAssignableUsers([]);
                return;
            }
            // Stockist → show Distributors (children)
            if (userRoles.includes('stockist')) {
                const res = await getMyChildren();
                if (res?.data?.success) setAssignableUsers(res.data.data || []);
                else setAssignableUsers([]);
                return;
            }
            // Distributor → show Dealers (children)
            if (userRoles.includes('distributor')) {
                const res = await getMyChildren();
                if (res?.data?.success) setAssignableUsers(res.data.data || []);
                else setAssignableUsers([]);
                return;
            }
            setAssignableUsers([]);
        } catch (e) {
            console.log(e);
            setAssignableUsers([]);
        }
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleManualChange = (e) => {
        setManualData({ ...manualData, [e.target.name]: e.target.value });
    };

    // Add API
    const handleSubmitManual = async () => {
        try {
            const baseErrors = collectErrors([
                { valid: isNonEmpty(manualData.name), message: 'Enter name' },
                { valid: isNonEmpty(manualData.mobile), message: 'Enter mobile' },
                { valid: isValidEmail(manualData.email), message: 'Enter valid email' },
                { valid: isNonEmpty(manualData.location), message: 'Enter location' },
            ]);
            if (baseErrors.length) { toast.error(baseErrors[0]); return; }
            for (let i = 0; i < requirements.length; i++) {
                const req = requirements[i];
                const errs = collectErrors([
                    { valid: isNonEmpty(req.cameraType), message: `Requirement ${i + 1}: Enter camera type` },
                    { valid: isPositiveInteger(String(req.quantity || '')), message: `Requirement ${i + 1}: Enter valid quantity` },
                ]);
                if (errs.length) { toast.error(errs[0]); return; }
            }
            const leadData = { ...manualData, requirement: requirements };
            await createLead(leadData); // axios API call
            closeModal();
            getConfig();
        } catch (error) {
            console.error("Error creating lead:", error);
        }
    };

    // Update API
    const handleSubmit = async () => {
        const { lastContactedBy, newNote, editLatestNote, ...restFormData } = formData;
        const updatedData = {
            ...selectedLead,
            ...restFormData,
            requirement: requirements
        };
        if (newNote && newNote.trim()) {
            updatedData.newNote = newNote.trim();
            if (editLatestNote) {
                updatedData.editLatestNote = true;
            }
        }

        try {
            const numericErrors = collectErrors([
                { valid: !formData.monthlyPurchaseCapacity || isPositiveInteger(String(formData.monthlyPurchaseCapacity)), message: 'Enter valid monthly purchase capacity' },
                { valid: !formData.avgPriceExpectation || isNonNegativeNumber(String(formData.avgPriceExpectation)), message: 'Enter valid average price expectation' },
            ]);
            if (numericErrors.length) { toast.error(numericErrors[0]); return; }
            for (let i = 0; i < requirements.length; i++) {
                const req = requirements[i];
                const errs = collectErrors([
                    { valid: isNonEmpty(req.cameraType), message: `Requirement ${i + 1}: Enter camera type` },
                    { valid: isPositiveInteger(String(req.quantity || '')), message: `Requirement ${i + 1}: Enter valid quantity` },
                ]);
                if (errs.length) { toast.error(errs[0]); return; }
            }
            const response = await updateLead(selectedLead._id, updatedData);
            closeModal();
            getConfig(); // refresh the data
        } catch (err) {
            console.error("Error updating lead:", err);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet); // Converts to JSON

            setJsonData(parsedData);
            console.log("Excel JSON:", parsedData);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSubmitMultiple = async () => {
        try {
            const response = await bulkUploadLeads(jsonData);
            // Entire response object
            console.log("Upload Success (full response):", response);
            // Actual data returned by backend
            closeModal();
            getConfig(); // refresh your lead list
        } catch (err) {
            console.error("Upload Error:", err);
        }
    };

    const getConfig = async (page) => {
        try {
            const response = await getAllLeads(page, email);
            setLeads(response.data.leads);
            setTotalPages(response.totalPages);
            setResultPerPage(response.limit);
            const response2 = await getAllStocks();
            console.log('response2', response2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load');
            console.error('Error:', error);
        }
    };


    useEffect(() => {
        getConfig();
        fetchAssignableUsers();
    }, []);

    const openModal = (modal, lead) => {
        setActiveModal(modal);
        // Determine if the latest note is by the current assignee; if yes, prefill for edit
        const assignedToId = (lead?.assignedTo && (lead?.assignedTo._id || lead?.assignedTo)) || "";
        const notesArr = Array.isArray(lead?.notes) ? lead.notes : [];
        const latestNote = notesArr.length > 0 ? notesArr[notesArr.length - 1] : null;
        const latestNoteAuthorId = latestNote && latestNote.createdBy && (latestNote.createdBy._id || latestNote.createdBy);
        const canEditLatestNote = Boolean(latestNote && assignedToId && String(latestNoteAuthorId) === String(assignedToId));

        setFormData({
            leadType: lead?.leadType || "",
            status: lead?.status || "",
            position: lead?.position || "",
            assignedTo: (lead?.assignedTo && (lead?.assignedTo._id || lead?.assignedTo)) || "",
            monthlyPurchaseCapacity: lead?.monthlyPurchaseCapacity || "",
            avgPriceExpectation: lead?.avgPriceExpectation || "",
            newNote: canEditLatestNote ? (latestNote?.text || '') : "",
            editLatestNote: canEditLatestNote,
            lastContactedBy: (lead?.lastContactedBy && (lead?.lastContactedBy._id || lead?.lastContactedBy)) || "",
        });
        // if (modal === 'Upload Files') {
        //     setSelectedReqId(id);
        // }
        setRequirements(lead?.requirement && lead?.requirement.length > 0 ? lead?.requirement : [{ cameraType: "", quantity: "", orderTimeline: "" }]);
        setSelectedLead(lead)
        onOpen();
    };

    const openAddModal = (modal) => {
        setActiveModal(modal);
        onOpen();
    }

    const closeModal = () => {
        setActiveModal(null);
        onClose();
    };

    // pagination code
    const [currentPage, setcurrentPage] = useState(1);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
    const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
    const [totalPages, setTotalPages] = useState();
    const [resultPerPage, setResultPerPage] = useState(5);
    // const [downloading, setDownloading] = useState(null);

    const handleNextClick = async () => {
        const nextPage = currentPage + 1;
        setLoadingNext(true);
        try {
            await getConfig(nextPage);
            setcurrentPage(nextPage);
        } finally {
            setLoadingNext(false);
        }
    };

    const handlePrevClick = async () => {
        const PrevPage = currentPage - 1;
        setLoadingPrev(true);
        try {
            await getConfig(PrevPage);
            setcurrentPage(PrevPage);
        } finally {
            setLoadingPrev(false);
        }
    };

    const [userIdToDelete, setUserIdToDelete] = useState(null);

    const confirmDelete = async () => {
        try {
            const deleteAdmin = await deleteLead(userIdToDelete);
            getConfig();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            closeModal();
        }
    };

    useState(() => {
        setPrevButtonDisabled(currentPage === 1);
        setNextButtonDisabled(currentPage === totalPages);
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
                        Leads
                    </Text>
                </Box>

                <Stack direction={['column', 'row']} align="center" spacing={4} mb={1}>
                    <Stack direction={['column', 'row']} align="center" spacing={4}>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter Device ID"
                            size="md"
                            maxWidth="200px"
                            focusBorderColor="green.400"
                            _focus={{ boxShadow: 'none', borderColor: 'green.400' }}
                        />
                        <Button onClick={() => { getConfig(currentPage) }} colorScheme='blue' variant='outline' size='md'>
                            Search
                        </Button>
                    </Stack>
                    <Button onClick={() => openAddModal('Add Leads')} colorScheme='green' variant='outline' size='md'>
                        ADD
                    </Button>
                </Stack>

                <TableContainer boxShadow={"0px 5px 22px 0px rgba(0, 0, 0, 0.04)"} borderRadius="md">
                    <Table>
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>Sr.No.</Th>
                                <Th>Name</Th>
                                <Th>Mobile</Th>
                                <Th>Email</Th>
                                <Th>Company</Th>
                                <Th>Location</Th>
                                <Th>Industry</Th>
                                {/* <Th>Customer</Th> */}
                                <Th>Detail</Th>
                                {canEditDelete && <Th>Edit/Delete</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {leads?.map((user, index) => (
                                <Tr key={user._id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{user?.name}</Td>
                                    <Td>{user?.mobile}</Td>
                                    <Td>{user?.email}</Td>
                                    <Td>{user?.company}</Td>
                                    <Td>{user?.location}</Td>
                                    <Td>{user?.industryType}</Td>
                                    <Td><Button onClick={() => openModal('leadDetails', user)}><BsEye /></Button></Td>
                                    {/* <Td>{user.customerType}</Td> */}
                                    {canEditDelete && (
                                        <Td textAlign="center" display="flex" gap={2}>
                                            {/* <Button
                                                variant="outline"
                                                colorScheme="blue"
                                                onClick={() => {
                                                    setEditableUserId(user._id);
                                                    setSelectedRoles(user.role || []);
                                                }}
                                            >
                                                Edit
                                            </Button> */}
                                            <Button
                                                variant="outline"
                                                colorScheme="red"
                                                onClick={() => {
                                                    setUserIdToDelete(user._id);
                                                    openModal("Delete User", user._id);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
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
            </Box>

            {/* Delete confirm (unchanged) */}
            {/* <Modal isOpen={isOpen && activeModal === "Add Leads"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Leads</ModalHeader>
                    <ModalBody>
                        <Flex>
                            <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
                            <Button onClick={handleSubmitMultiple}>Upload Data</Button>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
            <Modal isOpen={isOpen && activeModal === "Add Leads"} onClose={closeModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Leads</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* Option Selector */}
                        <Stack direction="row" spacing={4} mb={4}>
                            <Button
                                colorScheme={entryType === "manual" ? "blue" : "gray"}
                                onClick={() => setEntryType("manual")}
                            >
                                Manual Entry
                            </Button>
                            <Button
                                colorScheme={entryType === "excel" ? "blue" : "gray"}
                                onClick={() => setEntryType("excel")}
                            >
                                Excel Upload
                            </Button>
                        </Stack>

                        {/* Excel Upload Section */}
                        {entryType === "excel" && (
                            <Flex gap={2}>
                                <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
                                <Button onClick={handleSubmitMultiple}>Upload Data</Button>
                            </Flex>
                        )}

                        {/* Manual Entry Section */}
                        {entryType === "manual" && (
                            <Stack spacing={3}>
                                <Input
                                    placeholder="Name"
                                    name="name"
                                    value={manualData.name}
                                    onChange={handleManualChange}
                                    onKeyDown={allowAlphaSpaces}
                                />
                                <Input
                                    placeholder="Mobile"
                                    name="mobile"
                                    value={manualData.mobile}
                                    onChange={handleManualChange}
                                    onKeyDown={allowDigitsOnly}
                                />
                                <Input
                                    placeholder="Email"
                                    name="email"
                                    value={manualData.email}
                                    onChange={handleManualChange}
                                    onKeyDown={allowEmailChars}
                                />
                                <Input
                                    placeholder="Company"
                                    name="company"
                                    value={manualData.company}
                                    onChange={handleManualChange}
                                    onKeyDown={allowAlphaSpaces}
                                />
                                <Input
                                    placeholder="Location"
                                    name="location"
                                    value={manualData.location}
                                    onChange={handleManualChange}
                                    onKeyDown={allowAlphaSpaces}
                                />
                                {/* <Input
                                    placeholder="Industry Type"
                                    name="industryType"
                                    value={manualData.industryType}
                                    onChange={handleManualChange}
                                /> */}
                                {/* <Input
                                    placeholder="Customer Type"
                                    name="customerType"
                                    value={manualData.customerType}
                                    onChange={handleManualChange}
                                /> */}
                                <Select
                                    placeholder="Industry Type"
                                    name="industryType"
                                    value={manualData.industryType}
                                    onChange={handleManualChange}
                                >
                                    {["office", "factory", "home", "other"].map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Customer Type"
                                    name="customerType"
                                    value={manualData.customerType}
                                    onChange={handleManualChange}
                                >
                                    {["government", "stockist", "distributor", "dealer", "customer", "new customer", "other"].map(
                                        (option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        )
                                    )}
                                </Select>
                                {/* Requirement section */}
                                <Text fontWeight="bold">Requirements</Text>
                                {requirements.map((req, index) => (
                                    <Flex key={index} gap={2} mb={2}>
                                        <Input
                                            placeholder="Camera Type"
                                            value={req.cameraType}
                                            onChange={(e) => handleRequirementChange(index, "cameraType", e.target.value)}
                                            onKeyDown={allowAlphaSpaces}
                                        />
                                        <Input
                                            placeholder="Quantity"
                                            value={req.quantity}
                                            onChange={(e) => handleRequirementChange(index, "quantity", e.target.value)}
                                            onKeyDown={allowDigitsOnly}
                                        />
                                        <Input
                                            placeholder="Order Timeline"
                                            value={req.orderTimeline}
                                            onChange={(e) => handleRequirementChange(index, "orderTimeline", e.target.value)}
                                        />
                                        <Button colorScheme="red" onClick={() => handleRemoveRequirement(index)}>Remove</Button>
                                    </Flex>
                                ))}
                                <Button size="sm" leftIcon={<MdAdd />} onClick={handleAddRequirement}>
                                    Add Requirement
                                </Button>
                            </Stack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {entryType === "manual" && (
                            <Button colorScheme="blue" mr={3} onClick={handleSubmitManual}>
                                Submit
                            </Button>
                        )}
                        <Button onClick={closeModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen && activeModal === "Delete User"} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>Are you sure you want to delete this user?</ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={closeModal}>Cancel</Button>
                        <Button colorScheme="red" onClick={confirmDelete}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen && activeModal === "leadDetails"} onClose={closeModal} size="5xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Lead Details - {selectedLead?.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            {/* Read-only section */}
                            <Box p={3} bg="gray.50" rounded="md">
                                <Text><b>Name:</b> {selectedLead?.name}</Text>
                                <Text><b>Mobile:</b> {selectedLead?.mobile}</Text>
                                <Text><b>Email:</b> {selectedLead?.email}</Text>
                                <Text><b>Company:</b> {selectedLead?.company}</Text>
                                <Text><b>Location:</b> {selectedLead?.location}</Text>
                                <Text><b>Industry Type:</b> {selectedLead?.industryType}</Text>
                                <Text><b>Customer Type:</b> {selectedLead?.customerType}</Text>
                            </Box>

                            <Divider />

                            {/* Editable Fields */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl>
                                    <FormLabel>Lead Type</FormLabel>
                                    <Select
                                        placeholder="Select Lead Type"
                                        name="leadType"
                                        value={formData.leadType}
                                        onChange={handleChange}
                                    >
                                        {/* <option value="Hot">Hot</option>
                                        <option value="Warm">Warm</option>
                                        <option value="Cold">Cold</option> */}
                                        <option value="direct">Direct</option>
                                        <option value="advertisement">Advertisement</option>
                                        <option value="referral">Referral</option>
                                        <option value="website">Website</option>

                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        placeholder="Select Status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="New Lead">New Lead</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Position</FormLabel>
                                    <Input
                                        placeholder="Enter Position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        onKeyDown={allowAlphaSpaces}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Assigned To</FormLabel>
                                    {/* <Input
                                        placeholder="Assigned To"
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                    /> */}
                                    <Select
                                        placeholder="Assigned To"
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                        isDisabled={!(isPrivileged || userRoles.includes('stockist') || userRoles.includes('distributor'))}
                                    >
                                        {assignableUsers?.map((user) => (
                                            <option key={user._id} value={user._id}>{user.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Monthly Purchase Capacity</FormLabel>
                                    <Input
                                        placeholder="Monthly Purchase Capacity"
                                        name="monthlyPurchaseCapacity"
                                        value={formData.monthlyPurchaseCapacity}
                                        onChange={handleChange}
                                        onKeyDown={allowDigitsOnly}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Average Price Expectation</FormLabel>
                                    <Input
                                        placeholder="Average Price Expectation"
                                        name="avgPriceExpectation"
                                        value={formData.avgPriceExpectation}
                                        onChange={handleChange}
                                        onKeyDown={(e) => allowPrice(e, String(formData.avgPriceExpectation || ''))}
                                    />
                                </FormControl>

                                {/* Last Contacted By is auto-managed by backend; display read-only */}
                                <FormControl>
                                    <FormLabel>Last Contacted By</FormLabel>
                                    <Input value={selectedLead?.lastContactedBy?.name || '—'} isReadOnly />
                                </FormControl>

                                <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                                    <FormLabel>Previous Notes</FormLabel>
                                    <Stack spacing={2} maxH="200px" overflowY="auto" p={2} borderWidth="1px" borderRadius="md">
                                        {Array.isArray(selectedLead?.notes) && selectedLead.notes.length > 0 ? (
                                            selectedLead.notes.map((note, idx) => (
                                                <Box key={idx} p={2} bg="gray.50" borderRadius="md">
                                                    <Text fontSize="sm" whiteSpace="pre-wrap">{note.text}</Text>
                                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                                        {(note.createdBy && (note.createdBy.name || note.createdBy.email)) || '—'} • {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                                                    </Text>
                                                </Box>
                                            ))
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">No notes yet.</Text>
                                        )}
                                    </Stack>
                                </Box>

                                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                                    <FormLabel>{formData.editLatestNote ? 'Edit Latest Note' : 'Add New Note'}</FormLabel>
                                    <Textarea
                                        placeholder={formData.editLatestNote ? 'Edit your latest note' : 'Type a new note to append'}
                                        name="newNote"
                                        value={formData.newNote || ''}
                                        onChange={handleChange}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Divider />

                            {/* Requirements Editable Table */}
                            <Text fontWeight="bold" mt={3}>Requirements</Text>
                            <Table size="sm" variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Camera Type</Th>
                                        <Th>Quantity</Th>
                                        <Th>Order Timeline</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {requirements.map((req, index) => (
                                        <Tr key={index}>
                                            <Td>
                                                <Input
                                                    value={req.cameraType}
                                                    onChange={(e) => handleRequirementChange(index, "cameraType", e.target.value)}
                                                    placeholder="Camera Type"
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    value={req.quantity}
                                                    onChange={(e) => handleRequirementChange(index, "quantity", e.target.value)}
                                                    placeholder="Quantity"
                                                />
                                            </Td>
                                            <Td>
                                                <Input
                                                    value={req.orderTimeline}
                                                    onChange={(e) => handleRequirementChange(index, "orderTimeline", e.target.value)}
                                                    placeholder="Order Timeline"
                                                />
                                            </Td>
                                            <Td>
                                                <Button
                                                    size="xs"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveRequirement(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            <Button size="sm" mt={2} onClick={handleAddRequirement}>+ Add Requirement</Button>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button onClick={closeModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    );
}

export default Leads;
