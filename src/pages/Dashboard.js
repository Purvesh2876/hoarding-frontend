// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Text, theme } from '@chakra-ui/react';
import CustomCard from '../components/CustomCard';
import SessionTimeout from './SessionTimeout';
import { PiPlugsConnectedFill } from "react-icons/pi";
import { getAllStocks } from '../actions/crm-leadsActions';

const Dashboard = () => {

  const [products, setProducts] = useState([]);
  const fetchData = async () => {
    try {
      const response = await getAllStocks();
      console.log('Latest message:', response);
      setProducts(response?.stocks || []);
    } catch (error) {
      console.error("Error fetching server info:", error);
    }
  };


  useEffect(() => {
    fetchData(); // Fetch data immediately on mount
  }, []);


  //  
  // 
  // 
  // const pieChartCpu = {
  //   chart: {
  //     type: 'pie',
  //     height: '100%',
  //   },
  //   colors: [theme.colors.purple[500], theme.colors.blue[500]],
  //   labels: ['free', 'used'],
  //   title: {
  //     text: 'Provisioning CPU Usage',
  //     align: 'left',
  //   },
  //   legend: {
  //     position: 'top',
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   plotOptions: {
  //     pie: {
  //       expandOnClick: false
  //     }
  //   },
  //   tooltip: {
  //     fillSeriesColor: false
  //   },
  //   states: {
  //     active: {
  //       filter: {
  //         type: 'none'
  //       }
  //     },
  //     hover: {
  //       filter: {
  //         type: 'none'
  //       }
  //     }
  //   },
  // };

  // const pieChartSeriesCpu = [100 - serverInfo.cpuLoadPercent, serverInfo.cpuLoadPercent];

  // const pieChartRam = {
  //   chart: {
  //     type: 'pie',
  //     height: '100%',
  //   },
  //   colors: [theme.colors.purple[500], theme.colors.blue[500]],
  //   labels: ['free', 'used'],
  //   title: {
  //     text: 'Provisioning Ram Usage',
  //     align: 'left',
  //   },
  //   legend: {
  //     position: 'top',
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   plotOptions: {
  //     pie: {
  //       expandOnClick: false
  //     }
  //   },
  //   tooltip: {
  //     fillSeriesColor: false
  //   },
  //   states: {
  //     active: {
  //       filter: {
  //         type: 'none'
  //       }
  //     },
  //     hover: {
  //       filter: {
  //         type: 'none'
  //       }
  //     }
  //   },
  // };

  // const pieChartSeriesRam = [serverInfo.freeRamPercent, serverInfo.ramUsagePercent];

  return (
    <Box p={4}>
      <SessionTimeout timeoutDuration={1800000} />


      <Box padding='1% 2% 0.1%'>
        <Text
          sx={{
            color: "var(--primary-txt, #141E35)",
            fontFamily: "Inter",
            fontSize: "2xl",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            textTransform: "capitalize",
            textAlign: "left",
          }}
        >
          Overall Camera Info
        </Text>
      </Box>
      <Grid
        width='100%'
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={6}
        padding='1% 2% 0.1%'
      >
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product, index) => (
            <CustomCard
              key={product?._id || index}
              title={`${product?.productId?.productName || '-'}`}
              value={`${product?.quantity ?? 0}`}
              color="orange.500"
              bcolor="white"
              IconComponent={PiPlugsConnectedFill}
            />
          ))
        ) : (
          <Text>No stock available.</Text>
        )}
      </Grid>

      {/* <Grid
        width="100%"
        templateColumns={{
          base: "repeat(1, 1fr)",
          xl: "2fr 2fr",
          lg: "2fr 2fr",
          md: "1fr 1fr",
          sm: "1fr 1fr",
        }}
        gap={6}
        padding="2% 2%"
        height="500px"
      >
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            <PieChartComponent
              options={pieChartCpu}
              series={pieChartSeriesCpu}
            />
          </Box>
        </Box>
        <Box height="100%" display="flex" flexDirection="column">
          <Box flex="1">
            <PieChartComponent
              options={pieChartRam}
              series={pieChartSeriesRam}
            />
          </Box>
        </Box>
      </Grid> */}

    </Box>
  );
}

export default Dashboard;
