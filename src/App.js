import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Box, Container, Flex } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Leads from './pages/crm-leads';
import Requests from './pages/crm-request';
import OrderPage from './pages/orderPage';
import UserHierarchy from './pages/UserHierarchy';
import MyTeam from './pages/MyTeam';
import Hoardings from './pages/hoardings-hoardingPage';
import Enquiry from './pages/hoardings-enquiry';
import Users from './pages/hoardings-User';
import Customers from './pages/hoarding-customers';
import HoardingOrders from './pages/hoarding-orders';

function MainApp() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Read roles synchronously from localStorage on each render
  let isAdmin = false, isSales = false, isMarketing = false, isStockist = false, isDistributor = false, isMarketingLead = false, isMarketingLeadOnly = false;
  try {
    const roles = JSON.parse(localStorage.getItem('userRole') || '[]');
    const hasRole = (r) => Array.isArray(roles) && roles.includes(r);
    isAdmin = hasRole('admin');
    isSales = hasRole('sales');
    isMarketing = hasRole('marketing');
    isStockist = hasRole('stockist');
    isDistributor = hasRole('distributor');
    isMarketingLead = hasRole('marketing-lead');
    const privileged = ['admin', 'sales', 'marketing', 'stockist', 'distributor', 'dealer'];
    isMarketingLeadOnly = isMarketingLead && !roles.some(r => privileged.includes(r));
  } catch (_) {
    // ignore
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Container maxW="100vw" p="0">
      <Box>
        <Flex direction="column" height="100vh">
          {!isLoginPage && <Header isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}
          <Flex>
            {!isLoginPage && <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}
            <Flex p="20px" width="100%">
              <Box
                as="main"
                flex="1"
                position="absolute"
                left={isLoginPage ? '0' : { base: '0', lg: isCollapsed ? '80px' : '280px' }}
                top={isLoginPage ? '0' : '60px'}
                width={
                  isLoginPage
                    ? '100%'
                    : {
                      base: '100%',
                      lg: isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)',
                    }
                }
                transition="left 0.2s, width 0.2s"
                overflowY="auto"
                flexWrap="wrap"
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/hoardings" element={<Hoardings />} />
                  <Route path="/enquiries" element={<Enquiry />} />
                  <Route path="/usersHoarding" element={<Users />} />
                  <Route path="/dashboard" element={isMarketingLeadOnly ? <Navigate to="/leads" replace /> : <Dashboard />} />
                  <Route path="/requests" element={isMarketingLeadOnly ? <Navigate to="/leads" replace /> : <Requests />} />
                  <Route path="/orders" element={isMarketingLeadOnly ? <Navigate to="/leads" replace /> : <HoardingOrders />} />
                  <Route path="/customers" element={isMarketingLeadOnly ? <Navigate to="/leads" replace /> : <Customers />} />
                  <Route
                    path="/hierarchy"
                    element={(isAdmin || isSales || isMarketing) ? <UserHierarchy /> : <Navigate to={isMarketingLeadOnly ? '/leads' : '/dashboard'} replace />}
                  />
                  <Route
                    path="/myteam"
                    element={(isStockist || isDistributor) ? <MyTeam /> : <Navigate to={isMarketingLeadOnly ? '/leads' : '/dashboard'} replace />}
                  />

                  {/* <Route path="/batch" element={<BatchUpload />} /> */}
                </Routes>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
