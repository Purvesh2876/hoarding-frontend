import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { getChildrenByUserId, createEmsUser, getMe } from '../actions/userActions';
import { getStocksByUserId } from '../actions/crmActions';

const MyTeam = () => {
    const [me, setMe] = useState(null);
    const [children, setChildren] = useState([]);
    const [stockForUser, setStockForUser] = useState({ user: null, data: [] });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
    const [error, setError] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const init = async () => {
            const meRes = await getMe();
            const meData = meRes?.data || null;
            const roles = meData?.role || [];
            const userId = meData?._id || null;
            setMe({ _id: userId, roles });
            if (userId) {
                const res = await getChildrenByUserId(userId);
                if (res?.success) setChildren(res.data);
            }
            if (Array.isArray(roles) && roles.includes('stockist')) setRole('distributor'); else if (Array.isArray(roles) && roles.includes('distributor')) setRole('dealer');
        };
        init();
    }, []);

    const openStock = async (user) => {
        const res = await getStocksByUserId(user._id, 1, 100);
        setStockForUser({ user, data: res?.stocks || [] });
        onOpen();
    };

    const openCreate = () => {
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
            role,
            me?._id
        );
        if (!res?.success) {
            setError(res?.message || 'Failed to create user');
            return;
        }
        onCreateClose();
        const refresh = await getChildrenByUserId(me?._id);
        if (refresh?.success) setChildren(refresh.data);
    };

    const title = (me?.roles || []).includes('stockist') ? 'My Distributors' : 'My Dealers';
    console.log('MyTeam - Title:', title, 'Me:', me, 'Role:', role);

    return (
        <Box p={4}>
            <Heading size="md" mb={4}>{title}</Heading>
            <Button size="sm" mb={2} onClick={openCreate}>Create {role}</Button>
            <Table size="sm">
                <Thead><Tr><Th>Name</Th><Th>Email</Th><Th>Action</Th></Tr></Thead>
                <Tbody>
                    {children.map(c => (
                        <Tr key={c._id}>
                            <Td>{c.name}</Td>
                            <Td>{c.email}</Td>
                            <Td>
                                <Button size="xs" onClick={() => openStock(c)}>View Stock</Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

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
                    <ModalHeader>Create {role}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {error && <Text color="red.500" mb={2}>{error}</Text>}
                        <FormControl mb={3}><FormLabel>Name</FormLabel><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormControl>
                        <FormControl mb={3}><FormLabel>Email</FormLabel><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormControl>
                        <FormControl mb={3}><FormLabel>Mobile</FormLabel><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></FormControl>
                        <FormControl mb={3}><FormLabel>Password</FormLabel><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormControl>
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

export default MyTeam;


