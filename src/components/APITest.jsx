import React, { useState } from 'react';
import axios from 'axios';

function APITest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      console.log("Testing API URL:", url);
      
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      
      const response = await axios.post(url, formData);
      console.log("API Response:", response);
      
      setResult(`✅ API Working! Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.error("API Error:", error);
      setResult(`❌ API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateBilling = async () => {
    setLoading(true);
    setResult('Testing create billing...');
    
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      
      const formData = new FormData();
      formData.append("operation", "createBillingRecord");
      formData.append("json", JSON.stringify({ 
        booking_id: 1,
        employee_id: 1
      }));
      
      const response = await axios.post(url, formData);
      console.log("Create Billing Response:", response);
      
      setResult(`✅ Create Billing Working! Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.error("Create Billing Error:", error);
      setResult(`❌ Create Billing Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 API Test Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAPI}
          disabled={loading}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            marginRight: '10px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button 
          onClick={testCreateBilling}
          disabled={loading}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Create Billing'}
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {result || 'Click a button to test the API...'}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Debugging Steps:</h3>
        <ol>
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Test API Connection" button</li>
          <li>Check console for detailed logs</li>
          <li>If API fails, check if XAMPP is running</li>
          <li>Verify database connection in test_api.php</li>
        </ol>
      </div>
    </div>
  );
}

export default APITest;
