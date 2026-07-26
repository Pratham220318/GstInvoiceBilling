import React, { useState } from "react";

export default function InvoiceForm({
  invoiceData,
  currentUser,
  customers = [],
  onAddCustomer,
  onChange,
  onLoadTemplate,
  onSaveInvoice,
  onClearForm,
  savedInvoices = [],
  onLoadSavedInvoice,
  onDeleteInvoice,
}) {
  const [activeTab, setActiveTab] = useState("invoice-details");

  // State for Add Customer Form
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustGstin, setNewCustGstin] = useState("");
  const [newCustState, setNewCustState] = useState("");
  const [newCustStateCode, setNewCustStateCode] = useState("");

  const handleCustomerSelect = (cust) => {
    onChange({
      ...invoiceData,
      buyer: {
        ...invoiceData.buyer,
        name: cust.name,
        address: cust.address,
        gstin: cust.gstin,
        state: cust.state,
        stateCode: cust.stateCode,
      },
    });
  };

  const handleSaveCustomer = async () => {
    if (!newCustName.trim()) {
      alert("Please enter customer name");
      return;
    }
    const success = await onAddCustomer({
      name: newCustName,
      address: newCustAddress,
      gstin: newCustGstin,
      state: newCustState,
      stateCode: newCustStateCode,
    });
    if (success) {
      setNewCustName("");
      setNewCustAddress("");
      setNewCustGstin("");
      setNewCustState("");
      setNewCustStateCode("");
      setShowAddCust(false);
    }
  };

  const handleSellerChange = (field, val) => {
    onChange({
      ...invoiceData,
      seller: { ...invoiceData.seller, [field]: val },
    });
  };

  const handleBuyerChange = (field, val) => {
    onChange({
      ...invoiceData,
      buyer: { ...invoiceData.buyer, [field]: val },
    });
  };

  const handleMetadataChange = (field, val) => {
    onChange({
      ...invoiceData,
      metadata: { ...invoiceData.metadata, [field]: val },
    });
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: val };
    onChange({ ...invoiceData, items: newItems });
  };

  const handleAddItem = () => {
    const newItem = {
      description: "",
      hsn: "",
      quantity: 0,
      rateType: "incl", // default to Rate (Incl. of Tax)
      rate: 0,
      unit: "kg",
      gstRate: 18,
    };
    onChange({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const handleDeleteItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    onChange({ ...invoiceData, items: newItems });
  };

  const handleViewEditInvoice = (inv) => {
    alert(`Loading Invoice No. ${inv.metadata?.invoiceNo || "N/A"} for editing...`);
    onLoadSavedInvoice(inv);
    setActiveTab("invoice-details"); // Redirect back to Invoice Details tab
  };

  const handleDownloadInvoice = (inv) => {
    onLoadSavedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="editor-panel">
      {/* Editor Section Tabs */}
      <div className="editor-tabs">
        <button
          className={`tab-btn ${activeTab === "invoice-details" ? "active" : ""}`}
          onClick={() => setActiveTab("invoice-details")}
          style={{ flex: 1 }}
        >
          Invoice Details
        </button>
        <button
          className={`tab-btn ${activeTab === "saved-invoices" ? "active" : ""}`}
          onClick={() => setActiveTab("saved-invoices")}
          style={{ flex: 1 }}
        >
          Saved Invoices ({savedInvoices.length || 0})
        </button>
      </div>

      <div className="editor-content">
        {/* TAB 1: INVOICE DETAILS (MERGED TAB) */}
        {activeTab === "invoice-details" && (
          <div>
            {/* Quick Templates */}
            <div className="form-section-card">
              <div className="section-card-title">Quick Demo Templates</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {currentUser?.sellerName === "PREM ENTERPRISES" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onLoadTemplate(1)}
                      style={{ flex: "1 1 45%", fontSize: "0.75rem", padding: "0.4rem" }}
                    >
                      PDF 1 (Prem Single-Item)
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onLoadTemplate(3)}
                      style={{ flex: "1 1 45%", fontSize: "0.75rem", padding: "0.4rem" }}
                    >
                      PDF 3 (Prem Multi-Product)
                    </button>
                  </>
                )}
                {currentUser?.sellerName === "SRIDEVI ENTERPRISES" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onLoadTemplate(2)}
                    style={{ flex: "1 1 100%", fontSize: "0.75rem", padding: "0.4rem" }}
                  >
                    PDF 2 (Sridevi Single)
                  </button>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="form-section-card">
              <div className="section-card-title">Seller Details (From)</div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.seller?.name || ""}
                  disabled={true}
                  style={{ background: "rgba(255, 255, 255, 0.05)", cursor: "not-allowed", color: "#9ca3af" }}
                  placeholder="e.g. PREM ENTERPRISES"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={invoiceData.seller?.address || ""}
                  onChange={(e) => handleSellerChange("address", e.target.value)}
                  placeholder="Address, building details, city, pincode"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN/UIN</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.seller?.gstin || ""}
                  onChange={(e) => handleSellerChange("gstin", e.target.value)}
                  placeholder="27AAEPE2223R2ZM"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.seller?.state || ""}
                    onChange={(e) => handleSellerChange("state", e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.seller?.stateCode || ""}
                    onChange={(e) => handleSellerChange("stateCode", e.target.value)}
                    placeholder="27"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="form-section-card">
              <div className="section-card-title">Buyer Details (Bill To)</div>
              
              {/* Preset Customer Dropdown */}
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" style={{ color: "#3b82f6", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Select Preset Customer</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCust(!showAddCust)}
                    style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}
                  >
                    {showAddCust ? "Cancel" : "+ Add Customer to DB"}
                  </button>
                </label>
                {!showAddCust && (
                  <select
                    className="form-control"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleCustomerSelect(customers[parseInt(e.target.value)]);
                      }
                    }}
                    style={{ borderColor: "#2563eb", background: "rgba(30, 41, 59, 0.8)" }}
                  >
                    <option value="" disabled>Choose customer</option>
                    {customers.map((cust, idx) => (
                      <option key={cust.id || idx} value={idx}>{cust.name} ({cust.stateCode || cust.state_code})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Add Customer Form (UI addition) */}
              {showAddCust && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#60a5fa", marginBottom: "0.75rem" }}>Add New Customer Record</div>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="Company / Name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows="2" value={newCustAddress} onChange={(e) => setNewCustAddress(e.target.value)} placeholder="Billing Address" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN</label>
                    <input type="text" className="form-control" value={newCustGstin} onChange={(e) => setNewCustGstin(e.target.value)} placeholder="GSTIN No." />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" value={newCustState} onChange={(e) => setNewCustState(e.target.value)} placeholder="Maharashtra" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State Code</label>
                      <input type="text" className="form-control" value={newCustStateCode} onChange={(e) => setNewCustStateCode(e.target.value)} placeholder="27" />
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleSaveCustomer} style={{ width: "100%", fontSize: "0.8rem", padding: "0.5rem", marginTop: "0.5rem", justifyContent: "center" }}>
                    Save Customer to Database
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Buyer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.buyer?.name || ""}
                  onChange={(e) => handleBuyerChange("name", e.target.value)}
                  placeholder="Company/Individual Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={invoiceData.buyer?.address || ""}
                  onChange={(e) => handleBuyerChange("address", e.target.value)}
                  placeholder="Buyer's billing address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN/UIN</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.buyer?.gstin || ""}
                  onChange={(e) => handleBuyerChange("gstin", e.target.value)}
                  placeholder="e.g. 27AMKPN5833A2Z3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.buyer?.state || ""}
                    onChange={(e) => handleBuyerChange("state", e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.buyer?.stateCode || ""}
                    onChange={(e) => handleBuyerChange("stateCode", e.target.value)}
                    placeholder="27"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Meta details */}
            <div className="form-section-card">
              <div className="section-card-title">Basic Details</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Invoice No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.invoiceNo || ""}
                    onChange={(e) => handleMetadataChange("invoiceNo", e.target.value)}
                    placeholder="e.g. 04"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dated</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.dated || ""}
                    onChange={(e) => handleMetadataChange("dated", e.target.value)}
                    placeholder="e.g. 25-Jul-26"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Delivery Note</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.deliveryNote || ""}
                    onChange={(e) => handleMetadataChange("deliveryNote", e.target.value)}
                    placeholder="e.g. 04"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mode/Terms of Payment</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.paymentTerms || ""}
                    onChange={(e) => handleMetadataChange("paymentTerms", e.target.value)}
                    placeholder="e.g. Immediate / Cash"
                  />
                </div>
              </div>
            </div>

            <div className="form-section-card">
              <div className="section-card-title">References & Order</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Reference No. & Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.referenceNoDate || ""}
                    onChange={(e) => handleMetadataChange("referenceNoDate", e.target.value)}
                    placeholder="Reference Details"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Other References</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.otherReferences || ""}
                    onChange={(e) => handleMetadataChange("otherReferences", e.target.value)}
                    placeholder="Other details"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buyer's Order No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.buyerOrderNo || ""}
                    onChange={(e) => handleMetadataChange("buyerOrderNo", e.target.value)}
                    placeholder="Order number"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dated (Order Date)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.orderDate || ""}
                    onChange={(e) => handleMetadataChange("orderDate", e.target.value)}
                    placeholder="Order Date"
                  />
                </div>
              </div>
            </div>

            <div className="form-section-card">
              <div className="section-card-title">Dispatch & Delivery</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Dispatch Doc No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.dispatchDocNo || ""}
                    onChange={(e) => handleMetadataChange("dispatchDocNo", e.target.value)}
                    placeholder="e.g. 04"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Note Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.deliveryNoteDate || ""}
                    onChange={(e) => handleMetadataChange("deliveryNoteDate", e.target.value)}
                    placeholder="e.g. 25-Jul-26"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Dispatched through</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.dispatchedThrough || ""}
                    onChange={(e) => handleMetadataChange("dispatchedThrough", e.target.value)}
                    placeholder="e.g. Porter"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.destination || ""}
                    onChange={(e) => handleMetadataChange("destination", e.target.value)}
                    placeholder="e.g. Vasai"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bill of Lading/LR No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.billOfLading || ""}
                    onChange={(e) => handleMetadataChange("billOfLading", e.target.value)}
                    placeholder="LR details"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Motor Vehicle No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.motorVehicleNo || ""}
                    onChange={(e) => handleMetadataChange("motorVehicleNo", e.target.value)}
                    placeholder="e.g. MH-48-AN-1234"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Terms of Delivery</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={invoiceData.metadata?.termsOfDelivery || ""}
                  onChange={(e) => handleMetadataChange("termsOfDelivery", e.target.value)}
                  placeholder="Terms of delivery description..."
                />
              </div>
            </div>

            {/* <div className="form-section-card">
              <div className="section-card-title">Tax Calculations & Summary</div>
              <div className="form-group">
                <label className="form-label">Tax Rows Calculation Mode</label>
                <select
                  className="form-control"
                  value={invoiceData.taxMode}
                  onChange={(e) => onChange({ ...invoiceData, taxMode: e.target.value })}
                >
                  <option value="auto">Automatic (Auto-detect State Code)</option>
                  <option value="cgst-sgst">Force CGST / SGST Rows</option>
                  <option value="igst">Force IGST Rows</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount in Words Calculation</label>
                <select
                  className="form-control"
                  value={invoiceData.wordsMode}
                  onChange={(e) => onChange({ ...invoiceData, wordsMode: e.target.value })}
                >
                  <option value="grandTotal">Words for Grand Total (Final Amount)</option>
                  <option value="taxableValue">Words for Taxable Value (Subtotal)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Declaration</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={invoiceData.declaration || ""}
                  onChange={(e) => onChange({ ...invoiceData, declaration: e.target.value })}
                  placeholder="Declaration..."
                />
              </div>
            </div> */}

            {/* Line Items section (merged inside Invoice Details) */}
            <div className="form-section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1.5rem 0 1rem 0" }}>
              <div className="section-card-title" style={{ margin: 0 }}>Itemized Goods List</div>
              <button type="button" className="btn btn-primary" onClick={handleAddItem} style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                + Add Item
              </button>
            </div>

            {invoiceData.items.map((item, idx) => (
              <div key={idx} className="form-section-card item-card-editor" style={{ borderLeft: "4px solid #3b82f6", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#3b82f6" }}>Item #{idx + 1}</div>
                  {invoiceData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "bold"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description of Goods</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.description || ""}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    placeholder="Product name, specifications"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">HSN/SAC Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.hsn || ""}
                      onChange={(e) => handleItemChange(idx, "hsn", e.target.value)}
                      placeholder="e.g. 3923"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={item.gstRate || ""}
                      onChange={(e) => handleItemChange(idx, "gstRate", parseInt(e.target.value) || 0)}
                      placeholder="18"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.unit || ""}
                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                      placeholder="e.g. kg, PCS"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rate Type</label>
                    <select
                      className="form-control"
                      value={item.rateType || "incl"}
                      onChange={(e) => handleItemChange(idx, "rateType", e.target.value)}
                    >
                      <option value="incl">Rate (Incl. of Tax)</option>
                      <option value="excl">Rate (Excl. of Tax)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      value={item.rate || ""}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SAVED INVOICES DATA TABLE VIEW */}
        {activeTab === "saved-invoices" && (
          <div>
            <div className="form-section-card" style={{ padding: "1.25rem 1rem" }}>
              <div className="section-card-title">Saved Invoices Table</div>
              {savedInvoices.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", padding: "2.5rem 0" }}>
                  No saved invoices found. Save the current form as an invoice to display here.
                </div>
              ) : (
                <div className="table-responsive-container">
                  <table className="saved-invoices-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Buyer</th>
                        <th>Total</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedInvoices.map((inv) => {
                        const totalAmount = inv.items?.reduce((acc, item) => {
                          const qty = parseFloat(item.quantity) || 0;
                          const rate = parseFloat(item.rate) || 0;
                          const gst = parseFloat(item.gstRate) || 18;
                          let value = qty * rate;
                          if (item.rateType === "excl") {
                            value = value * (1 + gst / 100);
                          }
                          return acc + value;
                        }, 0) || 0;

                        return (
                          <tr key={inv.id}>
                            <td className="table-inv-no">#{inv.metadata?.invoiceNo || "N/A"}</td>
                            <td className="table-inv-date">{inv.metadata?.dated || "N/A"}</td>
                            <td className="table-inv-buyer" title={inv.buyer?.name}>{inv.buyer?.name || "N/A"}</td>
                            <td className="table-inv-total">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="table-actions-cell">
                              <button
                                type="button"
                                className="action-btn-load"
                                title="View and Edit invoice"
                                onClick={() => handleViewEditInvoice(inv)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </button>
                              <button
                                type="button"
                                className="action-btn-download"
                                title="Download invoice PDF"
                                onClick={() => handleDownloadInvoice(inv)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              </button>
                              <button
                                type="button"
                                className="action-btn-delete"
                                title="Delete invoice"
                                onClick={() => onDeleteInvoice(inv.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Workspace Operations: Commented out for now as requested */}
            {/*
            <div className="form-section-card">
              <div className="section-card-title">Workspace Operations</div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClearForm}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Clear Editor & Start Fresh
              </button>
            </div>
            */}
          </div>
        )}
      </div>

      {/* Global Bottom Actions inside form */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border-panel)", background: "rgba(10, 12, 22, 0.6)", display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSaveInvoice}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Save to Database
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
          style={{ flex: 1, justifyContent: "center", borderColor: "#60a5fa", color: "#60a5fa" }}
        >
          Print / PDF
        </button>
      </div>
    </div>
  );
}
