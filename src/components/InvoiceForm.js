import React, { useState } from "react";

const PRESET_CUSTOMERS = [
  {
    name: "SWAN AGRI PRODUCTS PVT.LTD.",
    address: "R-81 MIDC TTC Industrial Area,Ear Golde Garrage,\nRaale,Navi Mumbai,022-2690998/277695455",
    gstin: "27AAICS9978C1ZR",
    state: "Maharashtra",
    stateCode: "27",
  },
  {
    name: "PREM ENTERPRISES",
    address: "PROP : SHRIRAM ETHIRAJ GROUND FLOOR, PLOT NO.G/26,\nCLASSIC INDUSTRIES, NEAR KAMAN VILLAGE, POMAN,\nVASAI EAST, MUMBAI - 401208",
    gstin: "27AAEPE2223R2ZM",
    state: "Maharashtra",
    stateCode: "27",
  },
  {
    name: "MAHARAJA FARASAN",
    address: "B/2 80 Anna Nagar,Cross Road Dharavi,\nMumbai",
    gstin: "27ACVPN5208J1Z2",
    state: "Maharashtra",
    stateCode: "27",
  },
  {
    name: "M J ENTERPRISES",
    address: "526, 5th Floor A Wing, Princ Park\nRajdeep CHS Near PMGP Colony\nDharavi Mumbai - 400017",
    gstin: "27AGBPJ3363Q1Z0",
    state: "Maharashtra",
    stateCode: "27",
  },
  {
    name: "BHAKTI FOODS",
    address: "Gala No 4,Sagha Pada,\nD.E. Estate, Opp, Kaman Road,Chinchoti,\nVasai,Dist-Palghar",
    gstin: "27AJPPA1854Q1ZO",
    state: "Maharashtra",
    stateCode: "27",
  },
  {
    name: "SRIDEVI ENTERPRISES",
    address: "Grd Floor,Bulding No/flat No-1642 Satyam CHS,Sant\nRohidas Marg, Mukund Nagar,Dharavi,Mumbai 400017",
    gstin: "27AFCPE5975R1ZQ",
    state: "Maharashtra",
    stateCode: "27",
  }
];

export default function InvoiceForm({
  invoiceData,
  onChange,
  onLoadTemplate,
  onSaveInvoice,
  onClearForm,
  savedInvoices = [],
  onLoadSavedInvoice,
}) {
  const [activeTab, setActiveTab] = useState("seller-buyer");

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

  return (
    <div className="editor-panel">
      {/* Editor Section Tabs */}
      <div className="editor-tabs">
        <button
          className={`tab-btn ${activeTab === "seller-buyer" ? "active" : ""}`}
          onClick={() => setActiveTab("seller-buyer")}
        >
          Seller & Buyer
        </button>
        <button
          className={`tab-btn ${activeTab === "invoice-meta" ? "active" : ""}`}
          onClick={() => setActiveTab("invoice-meta")}
        >
          Invoice Details
        </button>
        <button
          className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          Line Items ({invoiceData.items?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "saved-invoices" ? "active" : ""}`}
          onClick={() => setActiveTab("saved-invoices")}
        >
          Saved Data
        </button>
      </div>

      <div className="editor-content">
        {/* TAB 1: SELLER & BUYER DETAILS */}
        {activeTab === "seller-buyer" && (
          <div>
            {/* Quick Templates */}
            <div className="form-section-card">
              <div className="section-card-title">Quick Demo Templates</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                  onClick={() => onLoadTemplate(2)}
                  style={{ flex: "1 1 45%", fontSize: "0.75rem", padding: "0.4rem" }}
                >
                  PDF 2 (Sridevi Single)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onLoadTemplate(3)}
                  style={{ flex: "1 1 100%", fontSize: "0.75rem", padding: "0.4rem" }}
                >
                  PDF 3 (Prem Multi-Product)
                </button>
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
                  onChange={(e) => handleSellerChange("name", e.target.value)}
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
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" style={{ color: "#3b82f6", fontWeight: "bold" }}>
                  Select Preset Customer
                </label>
                <select
                  className="form-control"
                  onChange={(e) => {
                    const idx = e.target.value;
                    if (idx !== "") {
                      handleCustomerSelect(PRESET_CUSTOMERS[idx]);
                    }
                  }}
                  defaultValue=""
                  style={{ background: "rgba(22, 28, 45, 0.9)", color: "#fff", borderColor: "#3b82f6" }}
                >
                  <option value="" disabled>-- Choose Preset Customer --</option>
                  {PRESET_CUSTOMERS.map((cust, index) => (
                    <option key={index} value={index}>
                      {cust.name} ({cust.state})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.buyer?.name || ""}
                  onChange={(e) => handleBuyerChange("name", e.target.value)}
                  placeholder="e.g. RAJADEEPA FOODS"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={invoiceData.buyer?.address || ""}
                  onChange={(e) => handleBuyerChange("address", e.target.value)}
                  placeholder="Buyer's delivery and billing address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN/UIN</label>
                <input
                  type="text"
                  className="form-control"
                  value={invoiceData.buyer?.gstin || ""}
                  onChange={(e) => handleBuyerChange("gstin", e.target.value)}
                  placeholder="33AHIPN6004E1ZR"
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
                    placeholder="Tamil Nadu"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.buyer?.stateCode || ""}
                    onChange={(e) => handleBuyerChange("stateCode", e.target.value)}
                    placeholder="33"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVOICE METADATA */}
        {activeTab === "invoice-meta" && (
          <div>
            <div className="form-section-card">
              <div className="section-card-title">Primary Invoice Identifiers</div>
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
                  <label className="form-label">Invoice Date</label>
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
                    placeholder="e.g. Immediate, Cash"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ref No. & Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.referenceNoDate || ""}
                    onChange={(e) => handleMetadataChange("referenceNoDate", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Other References</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.otherReferences || ""}
                    onChange={(e) => handleMetadataChange("otherReferences", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section-card">
              <div className="section-card-title">Order & Dispatch Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buyer's Order No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.buyerOrderNo || ""}
                    onChange={(e) => handleMetadataChange("buyerOrderNo", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.orderDate || ""}
                    onChange={(e) => handleMetadataChange("orderDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Dispatch Doc No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.dispatchDocNo || ""}
                    onChange={(e) => handleMetadataChange("dispatchDocNo", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Note Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.deliveryNoteDate || ""}
                    onChange={(e) => handleMetadataChange("deliveryNoteDate", e.target.value)}
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
                    placeholder="e.g. Portor"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.destination || ""}
                    onChange={(e) => handleMetadataChange("destination", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bill of Lading/LR-RR</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.billOfLading || ""}
                    onChange={(e) => handleMetadataChange("billOfLading", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Motor Vehicle No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={invoiceData.metadata?.motorVehicleNo || ""}
                    onChange={(e) => handleMetadataChange("motorVehicleNo", e.target.value)}
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
                />
              </div>
            </div>

            <div className="form-section-card">
              <div className="section-card-title">Tax and Word Formatting Settings</div>
              <div className="form-group">
                <label className="form-label">GST Tax Mode</label>
                <select
                  className="form-control"
                  value={invoiceData.taxMode}
                  onChange={(e) => onChange({ ...invoiceData, taxMode: e.target.value })}
                >
                  <option value="auto">Auto (IGST if States Differ, CGST+SGST if Same)</option>
                  <option value="cgst-sgst">Force CGST + SGST (9% + 9%)</option>
                  <option value="igst">Force IGST (18%)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Chargeable in Words Source</label>
                <select
                  className="form-control"
                  value={invoiceData.wordsMode}
                  onChange={(e) => onChange({ ...invoiceData, wordsMode: e.target.value })}
                >
                  <option value="grandTotal">(Recommended) Grand Total (Inclusive of Tax)</option>
                  <option value="taxableValue">Taxable Value (Before Tax - Matches PDF 1 & 2 standard)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Invoice Declaration Text</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={invoiceData.declaration || ""}
                  onChange={(e) => onChange({ ...invoiceData, declaration: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LINE ITEMS */}
        {activeTab === "items" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Items Details</span>
              <button type="button" className="btn btn-primary" onClick={handleAddItem} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                + Add New Item
              </button>
            </div>

            {invoiceData.items.map((item, idx) => (
              <div className="form-section-card item-row-edit" key={idx}>
                <div className="section-card-title">
                  <span>Item #{idx + 1}</span>
                  {invoiceData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDeleteItem(idx)}
                      style={{ padding: "0.15rem 0.4rem", borderRadius: "4px" }}
                    >
                      Delete
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
                    placeholder="e.g. PLASTIC PACKAGING BAGS"
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
                    <label className="form-label">Unit of Measure (per)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={item.unit || ""}
                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                      placeholder="e.g. kg, pcs, bags"
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
                    <label className="form-label">GST Tax Rate (%)</label>
                    <select
                      className="form-control"
                      value={item.gstRate}
                      onChange={(e) => handleItemChange(idx, "gstRate", e.target.value)}
                    >
                      <option value="18">18% (Standard)</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="28">28%</option>
                      <option value="0">0% (Exempt)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rate Setting</label>
                    <select
                      className="form-control"
                      value={item.rateType}
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

        {/* TAB 4: SAVED DATA / JSON DB */}
        {activeTab === "saved-invoices" && (
          <div>
            <div className="form-section-card">
              <div className="section-card-title">Saved Invoices (JSON DB)</div>
              {savedInvoices.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
                  No saved invoices found. Save the current form as an invoice to display here.
                </div>
              ) : (
                <div className="saved-invoices-list">
                  {savedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="invoice-item-card"
                      onClick={() => onLoadSavedInvoice(inv)}
                    >
                      <div className="invoice-item-info">
                        <span className="invoice-item-title">
                          Inv #{inv.metadata?.invoiceNo || "N/A"}
                        </span>
                        <span className="invoice-item-subtitle">
                          {inv.buyer?.name || "No Buyer Name"}
                        </span>
                        <span className="invoice-item-subtitle" style={{ fontSize: "0.7rem" }}>
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="invoice-item-meta">
                        ₹ {inv.items?.reduce((acc, item) => {
                          const qty = parseFloat(item.quantity) || 0;
                          const rate = parseFloat(item.rate) || 0;
                          const gst = parseFloat(item.gstRate) || 18;
                          let value = qty * rate;
                          if (item.rateType === "excl") {
                            value = value * (1 + gst / 100);
                          }
                          return acc + value;
                        }, 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section-card">
              <div className="section-card-title">JSON Operations</div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClearForm}
                style={{ width: "100%", marginBottom: "0.5rem" }}
              >
                Clear Form & Start Fresh
              </button>
            </div>
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
          Save to DB (JSON)
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
