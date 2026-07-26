"use client";

import React, { useState, useEffect } from "react";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";

const BLANK_INVOICE = {
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
  const [invoice, setInvoice] = useState(TEMPLATE_1);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch saved invoices from JSON database on load
  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setSavedInvoices(data);
      }
    } catch (err) {
      console.error("Error loading saved invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleInvoiceChange = (newVal) => {
    setInvoice(newVal);
  };

  const handleLoadTemplate = (num) => {
    if (num === 1) {
      setInvoice(TEMPLATE_1);
      showStatus("Loaded Template for PREM ENTERPRISES (PDF 1)");
    } else if (num === 2) {
      setInvoice(TEMPLATE_2);
      showStatus("Loaded Template for SRIDEVI ENTERPRISES (PDF 2)");
    } else if (num === 3) {
      setInvoice(TEMPLATE_3);
      showStatus("Loaded Template for PREM ENTERPRISES Multi-product (PDF 3)");
    }
  };

  const handleSaveInvoice = async () => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      if (res.ok) {
        const saved = await res.json();
        // Update current state with the returned invoice (includes ID)
        setInvoice(saved);
        fetchInvoices();
        showStatus("Invoice saved successfully to JSON database!");
      } else {
        showStatus("Failed to save invoice.", "error");
      }
    } catch (err) {
      console.error("Error saving invoice:", err);
      showStatus("Network error occurred while saving.", "error");
    }
  };

  const handleClearForm = () => {
    setInvoice(BLANK_INVOICE);
    showStatus("Form cleared.");
  };

  const handleLoadSavedInvoice = (savedInv) => {
    setInvoice(savedInv);
    showStatus(`Loaded Invoice No. ${savedInv.metadata?.invoiceNo || "N/A"}`);
  };

  const showStatus = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="dashboard-container">
      {/* Header Area */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          GST INVOICING <span className="logo-sub">Tally Look</span>
        </div>
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
        </div>
      </header>

      {/* Main Panels */}
      <main className="dashboard-main">
        {/* Editor (Left Panel) */}
        <InvoiceForm
          invoiceData={invoice}
          onChange={handleInvoiceChange}
          onLoadTemplate={handleLoadTemplate}
          onSaveInvoice={handleSaveInvoice}
          onClearForm={handleClearForm}
          savedInvoices={savedInvoices}
          onLoadSavedInvoice={handleLoadSavedInvoice}
        />

        {/* Live Preview (Right Panel) */}
        <div className="preview-panel">
          <InvoicePreview invoiceData={invoice} />
        </div>
      </main>
    </div>
  );
}

