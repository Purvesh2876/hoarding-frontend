import { Box, Stack, Avatar, Text, Grid, Flex } from '@chakra-ui/react';

const CustomCard = ({ title, value, sanand, color, bcolor, IconComponent, online, offline }) => {

  return (
    <Box borderWidth="0px" borderRadius="20px" overflow="hidden" style={{ boxShadow: ' 0px 5px 22px 0px rgba(0, 0, 0, 0.04), 0px 0px 0px 1px rgba(0, 0, 0, 0.06) ' }}>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
        }}
        gap={6}
        padding='2% 2%'
      >
        <Stack direction="row" justifyContent="space-between" p={6}>
          <Stack spacing={1} p='5px 0 5px 0'>
            <Text color="gray.500" fontSize="0.75rem" fontWeight='500' lineHeight={2.5} letterSpacing={'0.5px'} textTransform="uppercase">
              {title}
            </Text>
            <Text fontSize="1.3rem" fontWeight='500' >
              {value}
            </Text>
            <Text >
              {sanand}
            </Text>
            <Flex width={'100%'} justifyContent={'space-between'}>
              <Text >
                {online && <Text>🟢&nbsp;{online}</Text>}
              </Text>
              <Text >
                {offline && <Text>🔴&nbsp;{offline}</Text>}
              </Text>
            </Flex>
          </Stack>
          {/* <Avatar
          bg={color}
          borderColor={bcolor}
          borderWidth="0px"
          boxShadow="md"
          height="12"
          width="12"
        >
          {IconComponent && <IconComponent />}
        </Avatar> */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={color}
            borderColor={bcolor}
            borderWidth="0px"
            // boxShadow="md"
            height="56px"
            width="56px"
            borderRadius="50%"
          >
            {IconComponent && <IconComponent color={bcolor} size="24px" />} {/* Adjust size and color as needed */}
          </Box>
        </Stack>
      </Grid>
    </Box>
  );
};

export default CustomCard;
