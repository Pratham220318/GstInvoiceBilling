"use client";

import React, { useState, useEffect } from "react";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";
import Login from "../components/Login";

const BLANK_INVOICE = {
  id: "",
  seller: {
    name: "",
    address: "",
    gstin: "",
    state: "",
    stateCode: "",
  },
  buyer: {
    name: "",
    address: "",
    gstin: "",
    state: "",
    stateCode: "",
  },
  metadata: {
    invoiceNo: "",
    dated: "",
    deliveryNote: "",
    paymentTerms: "",
    referenceNoDate: "",
    otherReferences: "",
    buyerOrderNo: "",
    orderDate: "",
    dispatchDocNo: "",
    deliveryNoteDate: "",
    dispatchedThrough: "",
    destination: "",
    billOfLading: "",
    motorVehicleNo: "",
    termsOfDelivery: "",
  },
  items: [
    {
      description: "",
      hsn: "",
      quantity: 0,
      rateType: "incl",
      rate: 0,
      unit: "kg",
      gstRate: 18,
    },
  ],
  taxMode: "auto",
  wordsMode: "grandTotal",
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

const TEMPLATE_1 = {
  id: "",
  seller: {
    name: "PREM ENTERPRISES",
    address: "PROP : SHRIRAMETHIRAJGROUND FLOOR, PLOT NO.G/26,\nCLASSIC INDUSTRIES, NEAR KAMAN VILLAGE, POMAN,\nVASAI EAST, MUMBAI - 401208",
    gstin: "27AAEPE2223R2ZM",
    state: "Maharashtra",
    stateCode: "27",
  },
  buyer: {
    name: "RAJADEEPA FOODS",
    address: "7/80A/67, Alangulam Road, Anaithanadarpatti, Panayankuruchi,\nTirunelveli Dist. Tamil Nadu - 627 602.",
    gstin: "33AHIPN6004E1ZR",
    state: "Tamil Nadu",
    stateCode: "33",
  },
  metadata: {
    invoiceNo: "04",
    dated: "25-Jul-26",
    deliveryNote: "04",
    paymentTerms: "",
    referenceNoDate: "",
    otherReferences: "",
    buyerOrderNo: "",
    orderDate: "",
    dispatchDocNo: "04",
    deliveryNoteDate: "25-Jul-26",
    dispatchedThrough: "Portor",
    destination: "",
    billOfLading: "25-Jul-26",
    motorVehicleNo: "",
    termsOfDelivery: "",
  },
  items: [
    {
      description: "PLASTIC PACKAGING BAGS",
      hsn: "3923",
      quantity: 375.64,
      rateType: "incl",
      rate: 324.50,
      unit: "kg",
      gstRate: 18,
    },
  ],
  taxMode: "cgst-sgst", // PDF shows CGST/SGST even though inter-state
  wordsMode: "taxableValue", // Matches the PDF amount in words format
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

const TEMPLATE_2 = {
  id: "",
  seller: {
    name: "SRIDEVI ENTERPRISES",
    address: "Grd Floor,Bulding No/flat No-1642 Satyam CHS,Sant\nRohidas Marg, Mukund Nagar,Dharavi,Mumbai 400017",
    gstin: "27AFCPE5975R1ZQ",
    state: "Maharashtra",
    stateCode: "27",
  },
  buyer: {
    name: "OMSAISUDAR TRADERS",
    address: "Plot NO W171 TTC Industrial Area\nMIDC Pawane",
    gstin: "27AMKPN5833A2Z3",
    state: "Maharashtra",
    stateCode: "27",
  },
  metadata: {
    invoiceNo: "29",
    dated: "17-Jul-26",
    deliveryNote: "29",
    paymentTerms: "",
    referenceNoDate: "",
    otherReferences: "",
    buyerOrderNo: "",
    orderDate: "",
    dispatchDocNo: "29",
    deliveryNoteDate: "17-Jun-26",
    dispatchedThrough: "Portor",
    destination: "",
    billOfLading: "17-Jul-26",
    motorVehicleNo: "",
    termsOfDelivery: "",
  },
  items: [
    {
      description: "PLASTIC PACKAGING BAGS",
      hsn: "3923",
      quantity: 510,
      rateType: "incl",
      rate: 206.50,
      unit: "kg",
      gstRate: 18,
    },
  ],
  taxMode: "cgst-sgst",
  wordsMode: "taxableValue", // Matches the PDF amount in words format
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

const TEMPLATE_3 = {
  id: "",
  seller: {
    name: "PREM ENTERPRISES",
    address: "PROP : SHRIRAM ETHIRAJ GROUND FLOOR, PLOT NO.G/26,\nCLASSIC INDUSTRIES, NEAR KAMAN VILLAGE, POMAN,\nVASAI EAST, MUMBAI - 401208",
    gstin: "27AAEPE2223R2ZM",
    state: "Maharashtra",
    stateCode: "27",
  },
  buyer: {
    name: "M J ENTERPRISES",
    address: "526, 5th Floor A Wing, Princ Park\nRajdeep CHS Near PMGP Colony\nDharavi Mumbai - 400017",
    gstin: "27AGBPJ3363Q1Z0",
    state: "Maharashtra",
    stateCode: "27",
  },
  metadata: {
    invoiceNo: "29",
    dated: "03-Nov-25",
    deliveryNote: "29",
    paymentTerms: "",
    referenceNoDate: "",
    otherReferences: "",
    buyerOrderNo: "",
    orderDate: "",
    dispatchDocNo: "29",
    deliveryNoteDate: "03-Nov-25",
    dispatchedThrough: "Portor",
    destination: "",
    billOfLading: "03-Nov-25",
    motorVehicleNo: "",
    termsOfDelivery: "",
  },
  items: [
    {
      description: "LIVIA LARGE (24-18) METALIC BLACK",
      hsn: "68159990",
      quantity: 3,
      rateType: "excl", // set excl rate to match base value exactly
      rate: 6127.12,
      unit: "PCS",
      gstRate: 18,
    },
    {
      description: "BELL-ARGON WALL HUNG (457) WHITE",
      hsn: "6910",
      quantity: 4,
      rateType: "excl",
      rate: 4696.00,
      unit: "PCS",
      gstRate: 18,
    },
    {
      description: "GRACE PLAIN LARGE (24-18)",
      hsn: "73241000",
      quantity: 8,
      rateType: "excl",
      rate: 4006.78,
      unit: "PCS",
      gstRate: 18,
    },
  ],
  taxMode: "cgst-sgst",
  wordsMode: "taxableValue",
  declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [invoice, setInvoice] = useState(BLANK_INVOICE);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Mark client hydration complete
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("gst_invoice_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        // Load default user template
        if (parsedUser.sellerName === "PREM ENTERPRISES") {
          setInvoice(TEMPLATE_1);
        } else if (parsedUser.sellerName === "SRIDEVI ENTERPRISES") {
          setInvoice(TEMPLATE_2);
        } else {
          setInvoice(BLANK_INVOICE);
        }
        fetchInvoices(parsedUser.sellerName);
        fetchCustomers(parsedUser.sellerName);
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
  }, []);

  const fetchInvoices = async (sellerName) => {
    const activeSeller = sellerName || currentUser?.sellerName;
    if (!activeSeller) return;

    try {
      const res = await fetch("/api/invoices", {
        headers: {
          "x-user-seller": activeSeller
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedInvoices(data);
      }
    } catch (err) {
      console.error("Error loading saved invoices:", err);
    }
  };

  const fetchCustomers = async (sellerName) => {
    const activeSeller = sellerName || currentUser?.sellerName;
    if (!activeSeller) return;

    try {
      const res = await fetch("/api/customers", {
        headers: {
          "x-user-seller": activeSeller
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const handleInvoiceChange = (newVal) => {
    setInvoice(newVal);
  };

  const handleLoadTemplate = (num) => {
    if (currentUser?.sellerName === "PREM ENTERPRISES") {
      if (num === 1) {
        setInvoice(TEMPLATE_1);
        showStatus("Loaded Template 1 for PREM ENTERPRISES");
      } else if (num === 3) {
        setInvoice(TEMPLATE_3);
        showStatus("Loaded Multi-product Template for PREM ENTERPRISES");
      } else {
        showStatus("Permission Denied: SRIDEVI template is locked.", "error");
      }
    } else if (currentUser?.sellerName === "SRIDEVI ENTERPRISES") {
      if (num === 2) {
        setInvoice(TEMPLATE_2);
        showStatus("Loaded Template 2 for SRIDEVI ENTERPRISES");
      } else {
        showStatus("Permission Denied: PREM templates are locked.", "error");
      }
    }
  };

  const handleSaveInvoice = async () => {
    if (!currentUser) return;
    try {
      // Force the invoice seller name to match the logged-in user
      const updatedInvoice = {
        ...invoice,
        seller: {
          ...invoice.seller,
          name: currentUser.sellerName,
          // Prefill seller address/gstin if empty
          address: invoice.seller.address || (currentUser.sellerName === "PREM ENTERPRISES" ? TEMPLATE_1.seller.address : TEMPLATE_2.seller.address),
          gstin: invoice.seller.gstin || (currentUser.sellerName === "PREM ENTERPRISES" ? TEMPLATE_1.seller.gstin : TEMPLATE_2.seller.gstin),
          state: invoice.seller.state || (currentUser.sellerName === "PREM ENTERPRISES" ? TEMPLATE_1.seller.state : TEMPLATE_2.seller.state),
          stateCode: invoice.seller.stateCode || (currentUser.sellerName === "PREM ENTERPRISES" ? TEMPLATE_1.seller.stateCode : TEMPLATE_2.seller.stateCode),
        }
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-seller": currentUser.sellerName
        },
        body: JSON.stringify(updatedInvoice),
      });

      if (res.ok) {
        const saved = await res.json();
        setInvoice(saved);
        fetchInvoices(currentUser.sellerName);
        showStatus("Invoice saved successfully to database!");
      } else {
        const errData = await res.json();
        showStatus(errData.error || "Failed to save invoice.", "error");
      }
    } catch (err) {
      console.error("Error saving invoice:", err);
      showStatus("Network error occurred while saving.", "error");
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!currentUser || !id) return;
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`/api/invoices?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-user-seller": currentUser.sellerName
        }
      });

      if (res.ok) {
        showStatus("Invoice deleted successfully!");
        fetchInvoices(currentUser.sellerName);

        // Reset editor form if we deleted the loaded invoice
        if (invoice.id === id) {
          handleClearForm();
        }
      } else {
        const errData = await res.json();
        showStatus(errData.error || "Failed to delete invoice.", "error");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      showStatus("Network error during deletion.", "error");
    }
  };

  const handleAddCustomer = async (cust) => {
    if (!currentUser) return false;
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-seller": currentUser.sellerName
        },
        body: JSON.stringify(cust)
      });

      if (res.ok) {
        showStatus("Customer added successfully!");
        fetchCustomers(currentUser.sellerName);
        return true;
      } else {
        const errData = await res.json();
        showStatus(errData.error || "Failed to add customer.", "error");
        return false;
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      showStatus("Network error while adding customer.", "error");
      return false;
    }
  };

  const handleClearForm = () => {
    // Retain seller details when clearing form
    const defaultSeller = currentUser?.sellerName === "PREM ENTERPRISES" ? TEMPLATE_1.seller : TEMPLATE_2.seller;
    setInvoice({
      ...BLANK_INVOICE,
      seller: defaultSeller
    });
    showStatus("Form cleared.");
  };

  const handleLoadSavedInvoice = (savedInv) => {
    setInvoice(savedInv);
    showStatus(`Loaded Invoice No. ${savedInv.metadata?.invoiceNo || "N/A"}`);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("gst_invoice_user", JSON.stringify(user));
    }
    showStatus(`Logged in as ${user.sellerName}`);

    if (user.sellerName === "PREM ENTERPRISES") {
      setInvoice(TEMPLATE_1);
    } else if (user.sellerName === "SRIDEVI ENTERPRISES") {
      setInvoice(TEMPLATE_2);
    } else {
      setInvoice(BLANK_INVOICE);
    }
    fetchInvoices(user.sellerName);
    fetchCustomers(user.sellerName);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gst_invoice_user");
    }
    setSavedInvoices([]);
    setCustomers([]);
    setInvoice(BLANK_INVOICE);
    showStatus("Logged out successfully");
  };

  const showStatus = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  if (!isClient) {
    return (
      <div className="login-container">
        <div style={{ color: "#fff", fontSize: "1.2rem" }}>Loading portal...</div>
      </div>
    );
  }

  // Render login screen if no session
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-container">
      {/* Header Area */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          GST INVOICING <span className="logo-sub">Tally Look</span>
        </div>

        {/* User context information */}


        <div className="dashboard-actions">
          {statusMessage && (
            <div
              style={{
                fontSize: "0.85rem",
                padding: "0.4rem 1rem",
                borderRadius: "6px",
                background: statusMessage.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                color: statusMessage.type === "error" ? "#fca5a5" : "#a7f3d0",
                border: `1px solid ${statusMessage.type === "error" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                marginRight: "1rem",
              }}
            >
              {statusMessage.text}
            </div>
          )}
          <button type="button" className="btn btn-secondary" onClick={handleClearForm}>
            Reset Form
          </button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Print Invoice
          </button>
          <div className="user-profile-badge">
            <span className="user-seller-label">{currentUser.sellerName}</span>
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

      </header>

      {/* Main Panels */}
      <main className="dashboard-main">
        {/* Editor (Left Panel) */}
        <InvoiceForm
          invoiceData={invoice}
          currentUser={currentUser}
          customers={customers}
          onAddCustomer={handleAddCustomer}
          onChange={handleInvoiceChange}
          onLoadTemplate={handleLoadTemplate}
          onSaveInvoice={handleSaveInvoice}
          onClearForm={handleClearForm}
          savedInvoices={savedInvoices}
          onLoadSavedInvoice={handleLoadSavedInvoice}
          onDeleteInvoice={handleDeleteInvoice}
        />

        {/* Live Preview (Right Panel) */}
        <div className="preview-panel">
          <InvoicePreview invoiceData={invoice} />
        </div>
      </main>
    </div>
  );
}
