import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Stack, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, Text, GridItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getUsersByRole, getChildrenByUserId, createEmsUser } from '../actions/userActions';
import { getStocksByUserId } from '../actions/crmActions';

const UserHierarchy = () => {
    const [stockists, setStockists] = useState([]);
    const [selectedStockist, setSelectedStockist] = useState(null);
    const [distributors, setDistributors] = useState([]);
    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [dealers, setDealers] = useState([]);

    const [stockForUser, setStockForUser] = useState({ user: null, data: [] });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

    const [currentRoles, setCurrentRoles] = useState([]);
    const [createContext, setCreateContext] = useState({ role: 'stockist', parentId: null, parentLabel: '' });
    const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const roles = JSON.parse(localStorage.getItem('userRole') || '[]');
        setCurrentRoles(roles);
        const isPrivileged = roles.includes('admin') || roles.includes('sales') || roles.includes('marketing');
        if (!isPrivileged) {
            navigate('/myteam');
            return;
        }
        const loadStockists = async () => {
            const res = await getUsersByRole('stockist');
            if (res?.success) setStockists(res.data);
        };
        loadStockists();
    }, []);

    const openDistributors = async (stockist) => {
        setSelectedStockist(stockist);
        setSelectedDistributor(null);
        setDealers([]);
        const res = await getChildrenByUserId(stockist._id);
        if (res?.success) setDistributors(res.data);
    };

    const openDealers = async (distributor) => {
        setSelectedDistributor(distributor);
        const res = await getChildrenByUserId(distributor._id);
        if (res?.success) setDealers(res.data);
    };

    const openStock = async (user) => {
        const res = await getStocksByUserId(user._id, 1, 100);
        setStockForUser({ user, data: res?.stocks || [] });
        onOpen();
    };

    const openCreateForStockist = () => {
        setCreateContext({ role: 'stockist', parentId: null, parentLabel: '' });
        setForm({ name: '', email: '', mobile: '', password: '' });
        setError('');
        onCreateOpen();
    };
    const openCreateDistributorUnder = (stockist) => {
        setCreateContext({ role: 'distributor', parentId: stockist._id, parentLabel: stockist.name });
        setForm({ name: '', email: '', mobile: '', password: '' });
        setError('');
        onCreateOpen();
    };
    const openCreateDealerUnder = (distributor) => {
        setCreateContext({ role: 'dealer', parentId: distributor._id, parentLabel: distributor.name });
        setForm({ name: '', email: '', mobile: '', password: '' });
        setError('');
        onCreateOpen();
    };
    const submitCreate = async () => {
        setError('');
        if (!form.name || !form.email || !form.mobile || !form.password) {
            setError('Please fill all required fields');
            return;
        }
        const res = await createEmsUser(
            form.name,
            form.email,
            form.mobile,
            form.password,
            createContext.role,
            createContext.parentId || undefined
        );
        if (!res?.success) {
            setError(res?.message || 'Failed to create user');
            return;
        }
        onCreateClose();
        if (createContext.role === 'stockist') {
            const sres = await getUsersByRole('stockist');
            if (sres?.success) setStockists(sres.data);
        } else if (createContext.role === 'distributor' && selectedStockist) {
            openDistributors(selectedStockist);
        } else if (createContext.role === 'dealer' && selectedDistributor) {
            openDealers(selectedDistributor);
        }
    };

    return (
        <Box p={4}>
            <Heading size="md" mb={4}>User Hierarchy</Heading>
            {(currentRoles.includes('admin') || currentRoles.includes('sales') || currentRoles.includes('marketing')) && (
                <Button size="xs" mb={2} onClick={openCreateForStockist}>Create Stockist</Button>
            )}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="flex-start">
                <Box flex={1}>

                    <Heading size="sm" mb={2}>Stockists</Heading>
                    <Table size="sm">
                        <Thead><Tr><Th>Name</Th><Th>Action</Th></Tr></Thead>
                        <Tbody>
                            {stockists.map(s => (
                                <Tr key={s._id}>
                                    <Td>{s.name}</Td>
                                    <Td display={"grid"} gridTemplateColumns={{ base: 'repeat(1, auto)', md: 'repeat(2, auto)' }} gap={2} width={"max-content"} justifyItems={"start"}>
                                        <GridItem>
                                            <Button size="xs" onClick={() => openDistributors(s)}>Open</Button>
                                        </GridItem>
                                        <GridItem>
                                            <Button size="xs" onClick={() => openStock(s)}>View Stock</Button>
                                        </GridItem>
                                        {(currentRoles.includes('admin') || currentRoles.includes('stockist') || currentRoles.includes('sales') || currentRoles.includes('marketing')) && (
                                            <GridItem colSpan={{ base: 1, md: 2 }} w={"full"}>
                                                <Button size="xs" width="full" onClick={() => openCreateDistributorUnder(s)}>Create Distributor</Button>
                                            </GridItem>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {selectedStockist && (
                    <Box flex={1}>

                        <Heading size="sm" mb={2}>Distributors of {selectedStockist.name}</Heading>
                        <Table size="sm">
                            <Thead><Tr><Th>Name</Th><Th>Action</Th></Tr></Thead>
                            <Tbody>
                                {distributors.map(d => (
                                    <Tr key={d._id}>
                                        <Td>{d.name}</Td>
                                        <Td display={"grid"} gridTemplateColumns={{ base: 'repeat(1, auto)', md: 'repeat(2, auto)' }} gap={2} width={"max-content"} justifyItems={"start"}>
                                            <GridItem>
                                                <Button size="xs" onClick={() => openDealers(d)}>Open</Button>
                                            </GridItem>
                                            <GridItem>
                                                <Button size="xs" onClick={() => openStock(d)}>View Stock</Button>
                                            </GridItem>
                                            {(currentRoles.includes('admin') || currentRoles.includes('distributor') || currentRoles.includes('sales') || currentRoles.includes('marketing')) && (
                                                <GridItem colSpan={{ base: 1, md: 2 }} w={"full"}>
                                                    <Button size="xs" width={"full"} onClick={() => openCreateDealerUnder(d)}>Create Dealer</Button>
                                                </GridItem>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {selectedDistributor && (
                    <Box flex={1}>

                        <Heading size="sm" mb={2}>Dealers of {selectedDistributor.name}</Heading>
                        <Table size="sm">
                            <Thead><Tr><Th>Name</Th><Th>Action</Th></Tr></Thead>
                            <Tbody>
                                {dealers.map(dl => (
                                    <Tr key={dl._id}>
                                        <Td>{dl.name}</Td>
                                        <Td>
                                            <Button size="xs" onClick={() => openStock(dl)}>View Stock</Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </Stack>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Stock for {stockForUser.user?.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table size="sm">
                            <Thead><Tr><Th>Product</Th><Th isNumeric>Qty</Th></Tr></Thead>
                            <Tbody>
                                {(stockForUser.data || []).map((st) => (
                                    <Tr key={st._id}>
                                        <Td>{st.productId?.productName || '-'}</Td>
                                        <Td isNumeric>{st.quantity}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create {createContext.role}{createContext.parentLabel ? ` under ${createContext.parentLabel}` : ''}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {error && <Text color="red.500" mb={2}>{error}</Text>}
                        <FormControl mb={3}>
                            <FormLabel>Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Email</FormLabel>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Mobile</FormLabel>
                            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Password</FormLabel>
                            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </FormControl>
                        {currentRoles.includes('admin') && !createContext.parentId && (
                            <FormControl mb={3}>
                                <FormLabel>Role</FormLabel>
                                <Select value={createContext.role} onChange={(e) => setCreateContext({ ...createContext, role: e.target.value })}>
                                    <option value="stockist">stockist</option>
                                    <option value="admin">admin</option>
                                </Select>
                            </FormControl>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={onCreateClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={submitCreate}>Create</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default UserHierarchy;


