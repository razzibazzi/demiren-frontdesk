import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import APITest from './components/APITest';
import BookingChargesList from './frontdesk/BookingChargesList';
import BookingRequestList from './frontdesk/BookingListRequest';
import BookingChargesMaster from './frontdesk/BookingChargesMaster';
import BookingCreateInvoice from './frontdesk/BookingCreateInvoice';
import BookingDisplayInvoiceSample from './frontdesk/BookingDisplayInvoiceSample';

function App() {
  useEffect(() => {
    // Set the correct API URL
    const apiUrl = 'http://localhost/demiren/api/';
    if (localStorage.getItem('url') !== apiUrl) {
      localStorage.setItem('url', apiUrl);
      console.log('API URL set to:', apiUrl);
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/BookingChargesMaster" element={<BookingChargesMaster/>} />
            <Route path="/BookingListRequest" element={<BookingRequestList/>} />
            <Route path="/BookingChargesList" element={<BookingChargesList />} />
            <Route path="/BookingCreateInvoice" element={<BookingCreateInvoice />} />
            <Route path="/BookingDisplayInvoiceSample" element={<BookingDisplayInvoiceSample />} />
            <Route path="/APITest" element={<APITest />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
