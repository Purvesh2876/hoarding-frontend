import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Image,
  VStack,
  Heading,
  Text,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import { login } from "../actions/userActions";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

  const showImageSection = useBreakpointValue({ base: false, lg: true });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await login(username, password);
    if (response.success) {
      // Handle successful login
      const role = localStorage.getItem('userRole')
      if (role === 'admin') {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      // Handle login failure
      setErrorMessage(response.message);
    }
  };

  return (
    <Flex height="100vh">
      {/* Left Half: Login Form */}
      <Box flex="1" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} w="full" maxW="md" p={8} alignItems="flex-start">
          {/* <Image position={'fixed'} left={8} top={0} src="./ArcisAi.png" objectFit={'contain'} alt="Logo" boxSize="100px" mx="auto" mb={4} /> */}
          <Heading as="h2" size="lg" mb={2}>
            Log in
          </Heading>
          <Text color="gray.500" mb={6}>
            Welcome back! Please enter your details and get access to your digital vision.
          </Text>
          <Box w="full">
            <FormControl mb={4}>
              <FormLabel>Username</FormLabel>
              <Input onChange={(e) => setUsername(e.target.value)} type="email" placeholder="Enter Username" />
            </FormControl>
            <FormControl mb={1}>
              <FormLabel>Password</FormLabel>
              <Input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" />
            </FormControl>
            <p style={{ color: 'red' }}>{errorMessage}</p>
            {/* <Link color="purple.500" alignSelf="flex-end" mb={6} href="#">
              Forgot password?
            </Link> */}
            <br />
            <Button onClick={handleLogin} colorScheme="purple" w="full" mb={4}>
              Sign In
            </Button>
            {/* <Text align="center" w="full">
              Don't have an account?{" "}
              <Link color="purple.500" href="#">
                Sign up
              </Link>
            </Text> */}
          </Box>
        </VStack>
      </Box>

      {/* Right Half: Image Section, visible only on laptops */}
      {/* {showImageSection && (
        <Box flex="1" bg="gray.200">
          <Image
            src="./ems.png"
            alt="Example"
            objectFit="contain"
            height="100%"
            width="100%"
          />
        </Box>
      )} */}
    </Flex>
  );
};

export default LoginPage;
