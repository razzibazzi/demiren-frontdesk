import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function BookingCreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [billingBreakdown, setBillingBreakdown] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [bookingCharges, setBookingCharges] = useState([]);
  const [detailedCharges, setDetailedCharges] = useState(null);
  const [showDetailedCharges, setShowDetailedCharges] = useState(false);
  const [newChargeForm, setNewChargeForm] = useState({
    charge_name: '',
    charge_price: '',
    quantity: 1,
    category_id: 4
  });
  const [invoiceForm, setInvoiceForm] = useState({
    payment_method_id: 2,
    discount_id: null,
    vat_rate: 0.12,
    downpayment: 0,
    invoice_status_id: 1
  });

  const fetchBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      console.log("Fetching bookings from URL:", url);
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Response:", res.data);
      setBookings(res.data !== 0 ? res.data : []);
      console.log("Bookings set:", res.data !== 0 ? res.data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Error loading bookings: " + err.message);
    }
  };

  const validateBilling = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "validateBillingCompleteness");
      formData.append("json", JSON.stringify({ booking_id: bookingId }));
      
      const res = await axios.post(url, formData);
      setValidationResult(res.data);
      return res.data;
    } catch (err) {
      toast.error("Error validating billing");
      return { success: false, message: "Validation failed" };
    }
  };

  const createBillingRecord = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "createBillingRecord");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        employee_id: 1
      }));
      
      const res = await axios.post(url, formData);
      return res.data?.success || false;
    } catch (err) {
      console.error("Error creating billing record:", err);
      return false;
    }
  };

  const calculateBillingBreakdown = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "calculateComprehensiveBilling");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      }));
      
      console.log("Calculating billing breakdown for booking:", bookingId);
      console.log("Request data:", { 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      });
      
      const res = await axios.post(url, formData);
      console.log("Billing breakdown API response:", res.data);
      console.log("Billing breakdown type check:", {
        room_total: typeof res.data.room_total,
        room_total_value: res.data.room_total,
        charge_total: typeof res.data.charge_total,
        charge_total_value: res.data.charge_total
      });
      setBillingBreakdown(res.data);
      return res.data;
    } catch (err) {
      console.error("Error calculating billing breakdown:", err);
      toast.error("Error calculating billing breakdown: " + err.message);
      return null;
    }
  };

  const handleCreateInvoice = async (booking) => {
    console.log("handleCreateInvoice called with booking:", booking);
    setSelectedBooking(booking);
    
    try {
      // Step 1: Check if billing exists, if not create it
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record...");
        toast.info("Creating billing record...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        // Refresh bookings to get the new billing_id
        toast.success("Billing record created! Refreshing data...");
        await fetchBookings();
        // Continue to invoice creation after creating billing record
      }

      console.log("Billing_id found:", booking.billing_id);
      toast.info("Validating billing...");

      // Step 2: Validate billing completeness
      const validation = await validateBilling(booking.booking_id);
      console.log("Validation result:", validation);
      if (!validation.success) {
        toast.error(validation.message);
        return;
      }

      // Only block if there are pending charges, not missing room assignments
      if (validation.pending_charges > 0) {
        toast.warning(validation.message);
        return;
      }

      // Show warning if no rooms assigned but continue anyway
      if (validation.assigned_rooms === 0) {
        toast.warning("Note: No rooms assigned to this booking yet. Invoice will be created with current charges only.");
      }

      console.log("Billing validation passed, calculating breakdown...");
      toast.info("Calculating billing breakdown...");

      // Step 3: Calculate billing breakdown
      const breakdown = await calculateBillingBreakdown(booking.booking_id);
      console.log("Billing breakdown:", breakdown);
      if (!breakdown || !breakdown.success) {
        toast.error("Failed to calculate billing breakdown: " + (breakdown?.message || "Unknown error"));
        return;
      }

      console.log("Opening invoice modal...");
      console.log("showInvoiceModal state before setting:", showInvoiceModal);
      toast.success("Billing breakdown calculated successfully!");
      setShowInvoiceModal(true);
      console.log("showInvoiceModal state after setting: true");
    } catch (error) {
      console.error("Error in handleCreateInvoice:", error);
      toast.error("An error occurred while preparing invoice creation: " + error.message);
    }
  };

  const handleCreateBilling = async (booking) => {
    console.log("handleCreateBilling called with booking:", booking);
    setSelectedBooking(booking);
    
    try {
      // If no billing_id exists, create billing record first
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record first...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        toast.success("Billing record created successfully!");
      }

      // Load all charges for this booking
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: booking.booking_id }));
      
      console.log("Loading charges for booking:", booking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Charges response:", res.data);
      
      if (res.data.success) {
        setBookingCharges(res.data.charges);
        setShowBillingModal(true);
        toast.success(`Found ${res.data.total_charges_count} charges for this booking`);
      } else {
        toast.error("Failed to load charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error in handleCreateBilling:", error);
      toast.error("Error loading billing information: " + error.message);
    }
  };

  const handleAddCharge = async () => {
    if (!newChargeForm.charge_name || !newChargeForm.charge_price) {
      toast.error("Please fill in charge name and price");
      return;
    }

    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "addBookingCharge");
      formData.append("json", JSON.stringify({
        booking_id: selectedBooking.booking_id,
        charge_name: newChargeForm.charge_name,
        charge_price: parseFloat(newChargeForm.charge_price),
        quantity: parseInt(newChargeForm.quantity),
        category_id: newChargeForm.category_id
      }));
      
      console.log("Adding charge:", newChargeForm);
      const res = await axios.post(url, formData);
      console.log("Add charge response:", res.data);
      
      if (res.data.success) {
        toast.success("Charge added successfully!");
        // Reset form
        setNewChargeForm({
          charge_name: '',
          charge_price: '',
          quantity: 1,
          category_id: 4
        });
        // Reload charges
        handleCreateBilling(selectedBooking);
      } else {
        toast.error("Failed to add charge: " + res.data.message);
      }
    } catch (error) {
      console.error("Error adding charge:", error);
      toast.error("Error adding charge: " + error.message);
    }
  };

  const proceedToInvoice = () => {
    console.log("proceedToInvoice called with selectedBooking:", selectedBooking);
    setShowBillingModal(false);
    // Add a small delay to ensure modal closes before opening new one
    setTimeout(() => {
      handleCreateInvoice(selectedBooking);
    }, 100);
  };

  const loadDetailedCharges = async () => {
    if (!selectedBooking) return;
    
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getDetailedBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: selectedBooking.booking_id }));
      
      console.log("Loading detailed charges for booking:", selectedBooking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Detailed charges response:", res.data);
      
      if (res.data.success) {
        setDetailedCharges(res.data);
        setShowDetailedCharges(true);
        toast.success("Detailed charges loaded successfully!");
      } else {
        toast.error("Failed to load detailed charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error loading detailed charges:", error);
      toast.error("Error loading detailed charges: " + error.message);
    }
  };

  const confirmCreateInvoice = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }

    // If no billing_id, try to create one first
    if (!selectedBooking.billing_id) {
      const billingCreated = await createBillingRecord(selectedBooking.booking_id);
      if (!billingCreated) {
        toast.error("Failed to create billing record");
        return;
      }
      // Refresh and get updated booking data
      await fetchBookings();
      toast.info("Billing record created. Please try creating invoice again.");
      return;
    }

    try {
      setLoading(true);

      const jsonData = {
        billing_ids: [selectedBooking.billing_id],
        employee_id: 1, // Replace with session value
        payment_method_id: invoiceForm.payment_method_id,
        invoice_status_id: invoiceForm.invoice_status_id,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      };

      console.log("Creating invoice with data:", jsonData);

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = localStorage.getItem("url") + "transactions.php";
      const res = await axios.post(url, formData);

      console.log("Invoice creation response:", res.data);

      if (res.data?.success) {
        toast.success(res.data.message || "Invoice created successfully!");
        setShowInvoiceModal(false);
        setSelectedBooking(null);
        setBillingBreakdown(null);
        setValidationResult(null);
        fetchBookings(); // Refresh list
      } else {
        toast.error(res.data.message || "Failed to create invoice.");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error("An error occurred while creating the invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Debug function to test API connection
  const testAPIConnection = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Test Response:", res.data);
      toast.success("API connection successful!");
    } catch (err) {
      console.error("API Test Error:", err);
      toast.error("API connection failed: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Comprehensive Invoice Management</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
            This system validates all billing components before creating invoices, ensuring accuracy and completeness.
          </p>
        </div>
        <button 
          onClick={testAPIConnection}
          style={{ 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          🔧 Test API
        </button>
        <button onClick={() => {
          console.log("Debug: showInvoiceModal =", showInvoiceModal);
          console.log("Debug: selectedBooking =", selectedBooking);
          setShowInvoiceModal(true);
          console.log("Debug: Set showInvoiceModal to true");
        }} style={{ marginLeft: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          🐛 Debug Modal
        </button>
      </div>
      
      {loading && <p>Processing invoice...</p>}
      
      <table border="1" cellPadding={5} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th>Booking ID</th>
            <th>Reference No</th>
            <th>Customer</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Billing ID</th>
            <th>Invoice Status</th>
            <th>Validation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, index) => (
            <tr key={`booking-${b.booking_id}-${index}`}>
              <td>{b.booking_id}</td>
              <td>{b.reference_no}</td>
              <td>{b.customer_name || "Walk-In"}</td>
              <td>{b.booking_checkin_dateandtime}</td>
              <td>{b.booking_checkout_dateandtime}</td>
              <td>{b.billing_id || "None"}</td>
              <td>
                {b.invoice_id ? (
                  <span style={{ color: 'green' }}>✅ Created</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ Not Created</span>
                )}
              </td>
              <td>
                {b.billing_id && !b.invoice_id ? (
                  <button 
                    onClick={() => validateBilling(b.booking_id)}
                    style={{ fontSize: '12px', padding: '2px 6px' }}
                  >
                    Validate
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {!b.invoice_id ? (
                  <button 
                    onClick={() => {
                      console.log("Button clicked for booking:", b);
                      handleCreateBilling(b);
                    }}
                    style={{ 
                      backgroundColor: b.billing_id ? '#28a745' : '#ffc107', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {b.billing_id ? 'Review Billing' : 'Create Billing'}
                  </button>
                ) : (
                  <span style={{ color: 'green', fontSize: '12px' }}>✅ Invoice Created</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invoice Creation Modal */}
      {showInvoiceModal && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            minWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Create Invoice - Booking #{selectedBooking.booking_id}</h3>
            
            {/* Validation Results */}
            {validationResult && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: validationResult.is_complete ? '#d4edda' : '#f8d7da',
                border: `1px solid ${validationResult.is_complete ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <strong>Validation Status:</strong> {validationResult.message}
                {validationResult.pending_charges > 0 && (
                  <div>Pending Charges: {validationResult.pending_charges}</div>
                )}
                {validationResult.assigned_rooms > 0 && (
                  <div>Assigned Rooms: {validationResult.assigned_rooms}</div>
                )}
              </div>
            )}

            {/* Billing Breakdown */}
            {billingBreakdown && billingBreakdown.success && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Billing Breakdown</h4>
                {billingBreakdown ? (
                <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td><strong>Room Charges:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.room_total) || 0).toFixed(2)} ({billingBreakdown.room_count || 0} rooms)</td>
                    </tr>
                    <tr>
                      <td><strong>Additional Charges:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.charge_total) || 0).toFixed(2)} ({billingBreakdown.charge_count || 0} items)</td>
                    </tr>
                    <tr>
                      <td><strong>Subtotal:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.subtotal) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Discount:</strong></td>
                      <td>-₱{(parseFloat(billingBreakdown.discount_amount) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Amount After Discount:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.amount_after_discount) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>VAT ({((parseFloat(invoiceForm.vat_rate) || 0) * 100).toFixed(1)}%):</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.vat_amount) || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td><strong>Final Total:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.final_total) || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Downpayment:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.downpayment) || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff3cd' }}>
                      <td><strong>Balance Due:</strong></td>
                      <td>₱{(parseFloat(billingBreakdown.balance) || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                ) : (
                  <p>Loading billing breakdown...</p>
                )}

                {/* Detailed Charges Dropdown in Invoice Modal */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button 
                    onClick={loadDetailedCharges}
                    style={{ 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 20px', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '15px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    📋 View Detailed Charges Breakdown
                  </button>
                  
                  {showDetailedCharges && detailedCharges && (
                    <div style={{ 
                      border: '2px solid #007bff', 
                      borderRadius: '8px', 
                      padding: '20px', 
                      backgroundColor: '#f8f9fa',
                      marginTop: '15px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>
                        📊 Detailed Charges Breakdown
                      </h4>
                      
                      {/* Room Charges Section */}
                      {detailedCharges.room_charges && detailedCharges.room_charges.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <h5 style={{ color: '#007bff', marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>
                            🏨 Room Charges Details
                          </h5>
                          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: 'white' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                                <th style={{ padding: '10px' }}>Room Type</th>
                                <th style={{ padding: '10px' }}>Room Number</th>
                                <th style={{ padding: '10px' }}>Adults</th>
                                <th style={{ padding: '10px' }}>Children</th>
                                <th style={{ padding: '10px' }}>Capacity</th>
                                <th style={{ padding: '10px' }}>Beds</th>
                                <th style={{ padding: '10px' }}>Size</th>
                                <th style={{ padding: '10px' }}>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailedCharges.room_charges.map((room, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                  <td style={{ padding: '8px' }}>{room.charge_name}</td>
                                  <td style={{ padding: '8px' }}>{room.roomnumber_name || 'Not Assigned'}</td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>{room.bookingRoom_adult}</td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>{room.bookingRoom_children}</td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>{room.max_capacity}</td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>{room.roomtype_beds}</td>
                                  <td style={{ padding: '8px' }}>{room.roomtype_sizes}</td>
                                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ₱{(parseFloat(room.unit_price) || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ 
                            textAlign: 'right', 
                            marginTop: '15px', 
                            padding: '10px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            🏨 Room Total: ₱{detailedCharges.summary.room_total.toFixed(2)}
                          </div>
                        </div>
                      )}

                      {/* Additional Charges Section */}
                      {detailedCharges.additional_charges && detailedCharges.additional_charges.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <h5 style={{ color: '#28a745', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                            🛍️ Additional Charges Details
                          </h5>
                          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: 'white' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#e8f5e8', fontWeight: 'bold' }}>
                                <th style={{ padding: '10px' }}>Charge Name</th>
                                <th style={{ padding: '10px' }}>Category</th>
                                <th style={{ padding: '10px' }}>Room</th>
                                <th style={{ padding: '10px' }}>Unit Price</th>
                                <th style={{ padding: '10px' }}>Quantity</th>
                                <th style={{ padding: '10px' }}>Total</th>
                                <th style={{ padding: '10px' }}>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailedCharges.additional_charges.map((charge, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                  <td style={{ padding: '8px' }}>{charge.charge_name}</td>
                                  <td style={{ padding: '8px' }}>{charge.category}</td>
                                  <td style={{ padding: '8px' }}>{charge.room_number || charge.room_type}</td>
                                  <td style={{ padding: '8px', textAlign: 'right' }}>₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>{charge.quantity}</td>
                                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
                                  </td>
                                  <td style={{ padding: '8px' }}>{charge.charges_master_description || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ 
                            textAlign: 'right', 
                            marginTop: '15px', 
                            padding: '10px',
                            backgroundColor: '#e8f5e8',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            🛍️ Additional Total: ₱{detailedCharges.summary.charges_total.toFixed(2)}
                          </div>
                        </div>
                      )}

                      {/* Grand Total - Matching the billing breakdown style */}
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '20px', 
                        backgroundColor: '#fff3cd', 
                        border: '3px solid #ffc107',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginTop: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        💰 GRAND TOTAL: ₱{detailedCharges.summary.grand_total.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Form */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Invoice Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Payment Method:</label>
                  <select 
                    value={invoiceForm.payment_method_id} 
                    onChange={(e) => setInvoiceForm({...invoiceForm, payment_method_id: parseInt(e.target.value)})}
                  >
                    <option value={1}>GCash</option>
                    <option value={2}>Cash</option>
                    <option value={3}>Paymaya</option>
                    <option value={4}>Check</option>
                  </select>
                </div>
                <div>
                  <label>VAT Rate:</label>
                  <input
                    type="number"
                    value={invoiceForm.vat_rate}
                    onChange={(e) => setInvoiceForm({...invoiceForm, vat_rate: parseFloat(e.target.value)})}
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                <div>
                  <label>Downpayment:</label>
                  <input
                    type="number"
                    value={invoiceForm.downpayment}
                    onChange={(e) => setInvoiceForm({...invoiceForm, downpayment: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label>Invoice Status:</label>
                  <select 
                    value={invoiceForm.invoice_status_id} 
                    onChange={(e) => setInvoiceForm({...invoiceForm, invoice_status_id: parseInt(e.target.value)})}
                  >
                    <option value={1}>Complete</option>
                    <option value={2}>Incomplete</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={confirmCreateInvoice}
                disabled={loading}
                style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px',
                  marginRight: '10px'
                }}
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
              <button 
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedBooking(null);
                  setBillingBreakdown(null);
                  setValidationResult(null);
                  setDetailedCharges(null);
                  setShowDetailedCharges(false);
                }}
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Review Modal */}
      {showBillingModal && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            minWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Review Billing - Booking #{selectedBooking.booking_id} {selectedBooking.reference_no}</h3>
            
            {/* Current Charges */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Current Charges</h4>
              <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingCharges.map((charge, index) => (
                    <tr key={index}>
                      <td>{charge.charge_type}</td>
                      <td>{charge.charge_name}</td>
                      <td>{charge.category}</td>
                      <td>₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</td>
                      <td>{charge.quantity}</td>
                      <td>₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {bookingCharges.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#6c757d' }}>
                        No charges found for this booking
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Total Summary */}
              {bookingCharges.length > 0 && (
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                  <strong>Current Total: ₱{bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0).toFixed(2)}</strong>
                </div>
              )}

            </div>

            {/* Add New Charge Form */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>Add New Charge</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label>Charge Description:</label>
                  <input
                    type="text"
                    placeholder="e.g., Aircon Damage, TV Repair, Broken Vase"
                    value={newChargeForm.charge_name}
                    onChange={(e) => setNewChargeForm({...newChargeForm, charge_name: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Price:</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newChargeForm.charge_price}
                    onChange={(e) => setNewChargeForm({...newChargeForm, charge_price: e.target.value})}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={newChargeForm.quantity}
                    onChange={(e) => setNewChargeForm({...newChargeForm, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button 
                    onClick={handleAddCharge}
                    style={{ 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 15px', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Charge
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={proceedToInvoice}
                disabled={bookingCharges.length === 0}
                style={{ 
                  backgroundColor: bookingCharges.length === 0 ? '#6c757d' : '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px',
                  marginRight: '10px',
                  cursor: bookingCharges.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Proceed to Create Invoice
              </button>
              <button 
                onClick={() => {
                  setShowBillingModal(false);
                  setSelectedBooking(null);
                  setBookingCharges([]);
                  setDetailedCharges(null);
                  setShowDetailedCharges(false);
                  setNewChargeForm({
                    charge_name: '',
                    charge_price: '',
                    quantity: 1,
                    category_id: 4
                  });
                }}
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCreateInvoice;
