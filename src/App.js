import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BookingChargesList from './frontdesk/BookingChargesList';
import BookingRequestList from './frontdesk/BookingListRequest';
import BookingChargesMaster from './frontdesk/BookingChargesMaster';



function App() {
  useEffect(() => {
    if (localStorage.getItem('url') !== 'http://localhost/demiren/api/') {
      localStorage.setItem('url', 'http://localhost/demiren/api/');
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/BookingChargesMaster" element={<BookingChargesMaster/>} />
          <Route path="/" element={<BookingRequestList/>} />
          <Route path="/" element={<BookingChargesList />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
