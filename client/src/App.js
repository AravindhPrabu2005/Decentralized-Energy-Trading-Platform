import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignupPage from './components/Signup';
import LoginPage from './components/Loginpage';
import AdminSignupPage from './components/AdminSignup';
import ConsumerHome from './components/consumer/ConsumerHome';
import ProsumerHome from './components/prosumer/ProsumerHome';
import LandingPage from './components/LandingPage';
import ConsumerNavbar from './components/consumer/ConsumerNavbar';
import ConsumerProfile from './components/consumer/ConsumerProfile';
import ProsumerProfile from './components/prosumer/ProsumerProfile';
import ProsumerListing from './components/prosumer/ProsumerListing';
import ProsumerMarket from './components/prosumer/ProsumerMarket';
import ProsumerTransactions from './components/prosumer/ProsumerTransactions';
import ConsumerMarket from './components/consumer/ConsumerMarket';
import ConsumerTransactions from './components/consumer/ConsumerTransactions';

const App = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return (
        <Router>
            <Routes>
                {/* common routes */}
                <Route path="/" element={<LandingPage /> } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/consumer/signup" element={<SignupPage />} />
                <Route path="/prosumer/signup" element={<AdminSignupPage />} />

                {/* consumer routes */}
                <Route path="/consumer/home" element={<ConsumerHome /> } />
                <Route path="/consumer/profile" element={<ConsumerProfile />}  />
                <Route path="/consumer/marketplace" element={<ConsumerMarket/> } />
                <Route path="/consumer/my-orders" element={<ConsumerTransactions /> } />

                {/* prosumer rountes */}
                <Route path="/prosumer/home" element={<ProsumerHome /> } />
                <Route path="/prosumer/profile" element={<ProsumerProfile />}  />
                <Route path="/prosumer/my-listings" element={<ProsumerListing /> } />
                <Route path="/prosumer/marketplace" element={<ProsumerMarket /> } />
                <Route path="/prosumer/transactions" element={<ProsumerTransactions /> } />
                
            </Routes>
        </Router>
    );
};

export default App;
