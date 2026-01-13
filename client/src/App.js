import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignupPage from './components/Signup';
import LoginPage from './components/Loginpage';
import AdminSignupPage from './components/AdminSignup';
import ConsumerHome from './components/consumer/ConsumerHome';
import ProsumerHome from './components/prosumer/ProsumerHome';
import LandingPage from './components/LandingPage';

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


                {/* consumer rountes */}
                <Route path="/prosumer/home" element={<ProsumerHome /> } />
                
            </Routes>
        </Router>
    );
};

export default App;
