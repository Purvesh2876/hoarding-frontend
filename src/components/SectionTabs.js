import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, useColorModeValue } from "@chakra-ui/react";

const SectionTabs = ({ tabs = [], defaultIndex = 0, onChange }) => {
    const containerBg = useColorModeValue("gray.100", "gray.800");
    const containerBorder = useColorModeValue("gray.200", "whiteAlpha.300");
    const tabText = useColorModeValue("gray.600", "gray.300");
    const tabSelectedText = useColorModeValue("gray.900", "white");
    const tabSelectedBg = useColorModeValue("white", "whiteAlpha.200");
    const tabSelectedBorder = useColorModeValue("gray.200", "whiteAlpha.300");
    const tabListInsetShadow = useColorModeValue("inset 0 0 0 1px rgba(0,0,0,0.02)", "none");
    const selectedShadow = useColorModeValue("0 1px 2px rgba(0,0,0,0.08)", "sm");
    const hoverTextColor = useColorModeValue("gray.800", "white");

    return (
        <Box>
            <Tabs defaultIndex={defaultIndex} onChange={onChange} variant="unstyled">
                <TabList
                    bg={containerBg}
                    borderWidth="1px"
                    borderColor={containerBorder}
                    rounded="7px"
                    p="1"
                    w="fit-content"
                    boxShadow={tabListInsetShadow}
                    gap={1}
                >
                    {tabs.map((t, idx) => (
                        <Tab
                            key={idx}
                            px={4}
                            py={2}
                            rounded="5px"
                            fontWeight="600"
                            color={tabText}
                            _selected={{
                                color: tabSelectedText,
                                bg: tabSelectedBg,
                                borderWidth: "1px",
                                borderColor: tabSelectedBorder,
                                boxShadow: selectedShadow,
                            }}
                            _hover={{ color: hoverTextColor }}
                            _focusVisible={{
                                boxShadow: "0 0 0 2px rgba(59,130,246,0.5)",
                            }}
                        >
                            {t.label}
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {tabs.map((t, idx) => (
                        <TabPanel key={idx} px={0}>
                            {t.content}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default SectionTabs;


