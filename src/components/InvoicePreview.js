import React from "react";
import { convertNumberToWords } from "../utils/numberToWords";

export default function InvoicePreview({ invoiceData }) {
  const {
    seller = {},
    buyer = {},
    metadata = {},
    items = [],
    taxMode = "auto", // auto, cgst-sgst, igst
    wordsMode = "grandTotal", // grandTotal, taxableValue
    declaration = "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  } = invoiceData;

  // Formatting helpers
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "0.00";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatCurrencyNoSymbol = (val) => {
    return formatCurrency(val);
  };

  // Determine tax type (CGST/SGST vs IGST)
  let isIgst = false;
  if (taxMode === "igst") {
    isIgst = true;
  } else if (taxMode === "auto") {
    // If state codes are different, use IGST
    const sellerCode = seller.stateCode || "";
    const buyerCode = buyer.stateCode || "";
    if (sellerCode && buyerCode && sellerCode !== buyerCode) {
      isIgst = true;
    }
  }

  // Calculate calculations
  let totalTaxableValue = 0;
  let totalQuantity = 0;
  let unitName = "";

  // Helper arrays to calculate totals
  const itemCalculations = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const gstRate = parseFloat(item.gstRate) || 18; // default 18%
    const inputRate = parseFloat(item.rate) || 0;
    
    let rateExcl = 0;
    let rateIncl = 0;

    if (item.rateType === "incl") {
      rateIncl = inputRate;
      rateExcl = inputRate / (1 + gstRate / 100);
    } else {
      rateExcl = inputRate;
      rateIncl = inputRate * (1 + gstRate / 100);
    }

    const taxableAmount = qty * rateExcl;
    totalTaxableValue += taxableAmount;
    totalQuantity += qty;
    if (item.unit) unitName = item.unit; // track last unit or display generic

    return {
      ...item,
      qty,
      gstRate,
      rateExcl,
      rateIncl,
      taxableAmount,
    };
  });

  // Calculate taxes
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  itemCalculations.forEach((item) => {
    const tax = item.taxableAmount * (item.gstRate / 100);
    if (isIgst) {
      igstTotal += tax;
    } else {
      cgstTotal += tax / 2;
      sgstTotal += tax / 2;
    }
  });

  const totalTaxes = isIgst ? igstTotal : (cgstTotal + sgstTotal);
  const grandTotalBeforeRounding = totalTaxableValue + totalTaxes;
  const grandTotalRounded = Math.round(grandTotalBeforeRounding);
  const roundOffValue = grandTotalRounded - grandTotalBeforeRounding;

  // Tax breakdown by GST Rate (merging HSNs in a comma-separated list if they share the same rate)
  const gstRateGroups = {};
  itemCalculations.forEach((item) => {
    const rate = item.gstRate || 18;
    if (!gstRateGroups[rate]) {
      gstRateGroups[rate] = {
        hsnList: new Set(),
        taxableValue: 0,
        gstRate: rate,
        taxAmount: 0,
      };
    }
    if (item.hsn) gstRateGroups[rate].hsnList.add(item.hsn);
    gstRateGroups[rate].taxableValue += item.taxableAmount;
    gstRateGroups[rate].taxAmount += item.taxableAmount * (rate / 100);
  });

  const hsnGroups = {};
  Object.values(gstRateGroups).forEach((group, index) => {
    const joinedHsn = Array.from(group.hsnList).join(", ") || "N/A";
    hsnGroups[index] = {
      hsn: joinedHsn,
      taxableValue: group.taxableValue,
      gstRate: group.gstRate,
      taxAmount: group.taxAmount
    };
  });

  const amountWordsSource = wordsMode === "taxableValue" ? totalTaxableValue : grandTotalRounded;
  const amountInWords = convertNumberToWords(amountWordsSource);
  const taxInWords = convertNumberToWords(totalTaxes);

  // Split lines for company address and buyer address
  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr;
  };

  return (
    <div className="invoice-paper-wrapper">
      <div className="invoice-paper" id="printable-invoice">
        {/* Tax Invoice Title Header */}
        <div className="invoice-header-title">Tax Invoice</div>

        {/* Company and Metadata block */}
        <div className="invoice-row-flex border-bottom">
          {/* Seller details */}
          <div className="company-details-block border-right">
            <div className="company-name">{seller.name || "PREM ENTERPRISES"}</div>
            <div className="company-address">{formatAddress(seller.address)}</div>
            {seller.gstin && (
              <div className="company-gst">
                GSTIN/UIN: {seller.gstin}
              </div>
            )}
            {seller.state && (
              <div>
                State Name: {seller.state}
                {seller.stateCode && `, Code: ${seller.stateCode}`}
              </div>
            )}
          </div>

          {/* Invoice Metadata (Right) */}
          <div className="metadata-grid-block">
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Invoice No.</span>
                <span className="meta-value">{metadata.invoiceNo || "04"}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Dated</span>
                <span className="meta-value">{metadata.dated || "25-Jul-26"}</span>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Delivery Note</span>
                <span className="meta-value">{metadata.deliveryNote || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Mode/Terms of Payment</span>
                <span className="meta-value">{metadata.paymentTerms || ""}</span>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Reference No. & Date.</span>
                <span className="meta-value">{metadata.referenceNoDate || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Other References</span>
                <span className="meta-value">{metadata.otherReferences || ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch details block */}
        <div className="invoice-row-flex border-bottom">
          <div className="buyer-details-block border-right" style={{ flex: 1 }}>
            <div className="buyer-label">Buyer (Bill To)</div>
            <div className="company-name" style={{ fontSize: "11px", fontWeight: "bold" }}>
              {buyer.name || "RAJADEEPA FOODS"}
            </div>
            <div className="company-address">{formatAddress(buyer.address)}</div>
            {buyer.gstin && (
              <div className="company-gst">
                GSTIN/UIN: {buyer.gstin}
              </div>
            )}
            {buyer.state && (
              <div>
                State Name: {buyer.state}
                {buyer.stateCode && `, Code: ${buyer.stateCode}`}
              </div>
            )}
          </div>

          <div className="metadata-grid-block" style={{ flex: 1 }}>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Buyer's Order No.</span>
                <span className="meta-value">{metadata.buyerOrderNo || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Dated</span>
                <span className="meta-value">{metadata.orderDate || ""}</span>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Dispatch Doc No.</span>
                <span className="meta-value">{metadata.dispatchDocNo || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Delivery Note Date</span>
                <span className="meta-value">{metadata.deliveryNoteDate || ""}</span>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Dispatched through</span>
                <span className="meta-value">{metadata.dispatchedThrough || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Destination</span>
                <span className="meta-value">{metadata.destination || ""}</span>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-cell">
                <span className="meta-label">Bill of Lading/LR-RR No.</span>
                <span className="meta-value">{metadata.billOfLading || ""}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Motor Vehicle No.</span>
                <span className="meta-value">{metadata.motorVehicleNo || ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms of Delivery */}
        <div className="invoice-row-flex border-bottom" style={{ minHeight: "35px" }}>
          <div className="company-details-block" style={{ flex: 1 }}>
            <span className="meta-label">Terms of Delivery</span>
            <span className="meta-value" style={{ fontWeight: "normal", fontSize: "10px" }}>
              {metadata.termsOfDelivery || ""}
            </span>
          </div>
        </div>

        {/* Goods table */}
        <div className="goods-table">
          <div className="goods-thead">
            <div className="goods-th col-sr">Sr.<br />No.</div>
            <div className="goods-th col-desc">Description of Goods</div>
            <div className="goods-th col-hsn">HSN/SAC</div>
            <div className="goods-th col-qty">Quantity</div>
            <div className="goods-th col-rate-incl">Rate<br />(Incl. of Tax)</div>
            <div className="goods-th col-rate">Rate</div>
            <div className="goods-th col-per">per</div>
            <div className="goods-th col-amount">Amount</div>
          </div>          <div className="goods-tbody">
            {itemCalculations.map((item, idx) => (
              <div
                className="goods-row"
                key={idx}
              >
                <div className="goods-td col-sr">{idx + 1}</div>
                <div className="goods-td col-desc">
                  <div className="desc-main-text">{item.description}</div>
                </div>
                <div className="goods-td col-hsn">{item.hsn}</div>
                <div className="goods-td col-qty">
                  <strong>{item.qty} {item.unit}</strong>
                </div>
                <div className="goods-td col-rate-incl">
                  {formatCurrencyNoSymbol(item.rateIncl)}
                </div>
                <div className="goods-td col-rate">
                  {formatCurrencyNoSymbol(item.rateExcl)}
                </div>
                <div className="goods-td col-per">
                  {item.unit}
                </div>
                <div className="goods-td col-amount">
                  <strong>{formatCurrencyNoSymbol(item.taxableAmount)}</strong>
                </div>
              </div>
            ))}

            {/* Sub Total (Only rendered if there are multiple items) */}
            {itemCalculations.length > 1 && (
              <div className="goods-row goods-summary-row" style={{ fontWeight: "bold" }}>
                <div className="goods-td col-sr"></div>
                <div className="goods-td col-desc" style={{ alignItems: "flex-end" }}>Sub Total</div>
                <div className="goods-td col-hsn"></div>
                <div className="goods-td col-qty"></div>
                <div className="goods-td col-rate-incl"></div>
                <div className="goods-td col-rate"></div>
                <div className="goods-td col-per"></div>
                <div className="goods-td col-amount">
                  {formatCurrencyNoSymbol(totalTaxableValue)}
                </div>
              </div>
            )}

            {/* Tax Rows */}
            {!isIgst ? (
              <>
                <div className="goods-row goods-summary-row">
                  <div className="goods-td col-sr"></div>
                  <div className="goods-td col-desc" style={{ alignItems: "flex-end" }}>
                    OUTPUT SGST 9%
                  </div>
                  <div className="goods-td col-hsn"></div>
                  <div className="goods-td col-qty"></div>
                  <div className="goods-td col-rate-incl"></div>
                  <div className="goods-td col-rate"></div>
                  <div className="goods-td col-per"></div>
                  <div className="goods-td col-amount">
                    {formatCurrencyNoSymbol(cgstTotal)}
                  </div>
                </div>
                <div className="goods-row goods-summary-row">
                  <div className="goods-td col-sr"></div>
                  <div className="goods-td col-desc" style={{ alignItems: "flex-end" }}>
                    OUTPUT CGST 9%
                  </div>
                  <div className="goods-td col-hsn"></div>
                  <div className="goods-td col-qty"></div>
                  <div className="goods-td col-rate-incl"></div>
                  <div className="goods-td col-rate"></div>
                  <div className="goods-td col-per"></div>
                  <div className="goods-td col-amount">
                    {formatCurrencyNoSymbol(sgstTotal)}
                  </div>
                </div>
              </>
            ) : (
              <div className="goods-row goods-summary-row">
                <div className="goods-td col-sr"></div>
                <div className="goods-td col-desc" style={{ alignItems: "flex-end" }}>
                  OUTPUT IGST 18%
                </div>
                <div className="goods-td col-hsn"></div>
                <div className="goods-td col-qty"></div>
                <div className="goods-td col-rate-incl"></div>
                <div className="goods-td col-rate"></div>
                <div className="goods-td col-per"></div>
                <div className="goods-td col-amount">
                  {formatCurrencyNoSymbol(igstTotal)}
                </div>
              </div>
            )}

            {/* Round Off Row */}
            <div className="goods-row goods-summary-row" style={{ fontStyle: "italic" }}>
              <div className="goods-td col-sr"></div>
              <div className="goods-td col-desc" style={{ alignItems: "flex-end" }}>
                {roundOffValue >= 0 ? "Add:" : "Less:"} Round Off
              </div>
              <div className="goods-td col-hsn"></div>
              <div className="goods-td col-qty"></div>
              <div className="goods-td col-rate-incl"></div>
              <div className="goods-td col-rate"></div>
              <div className="goods-td col-per"></div>
              <div className="goods-td col-amount" style={{ fontWeight: "bold" }}>
                {roundOffValue >= 0 ? "" : "(-)"} {formatCurrencyNoSymbol(Math.abs(roundOffValue))}
              </div>
            </div>

            {/* Spacer Row (Stretches to fill remaining height) */}
            <div className="goods-row goods-spacer-row">
              <div className="goods-td col-sr"></div>
              <div className="goods-td col-desc"></div>
              <div className="goods-td col-hsn"></div>
              <div className="goods-td col-qty"></div>
              <div className="goods-td col-rate-incl"></div>
              <div className="goods-td col-rate"></div>
              <div className="goods-td col-per"></div>
              <div className="goods-td col-amount"></div>
            </div>
          </div>

          {/* Table Totals Row */}
          <div className="goods-total-row">
            <div className="goods-total-td col-sr"></div>
            <div className="goods-total-td col-desc">Total</div>
            <div className="goods-total-td col-hsn"></div>
            <div className="goods-total-td col-qty">
              {Number.isInteger(totalQuantity) ? totalQuantity : totalQuantity.toFixed(2)} {unitName}
            </div>
            <div className="goods-total-td col-rate-incl"></div>
            <div className="goods-total-td col-rate"></div>
            <div className="goods-total-td col-per"></div>
            <div className="goods-total-td col-amount" style={{ fontSize: "12px" }}>
              ₹ {formatCurrencyNoSymbol(grandTotalRounded)}
            </div>
          </div>
        </div>

        {/* Amount Chargeable in words */}
        <div className="amount-words-block">
          <div className="words-label">Amount Chargeable (in words)</div>
          <div className="words-value">{amountInWords}</div>
        </div>

        {/* Tax Breakdown Table */}
        <table className="hsn-tax-table">
          <thead>
            <tr>
              <th rowSpan="2" style={{ width: "15%" }}>HSN/SAC</th>
              <th rowSpan="2" style={{ width: "20%" }}>Taxable Value</th>
              {!isIgst ? (
                <>
                  <th colSpan="2">CGST</th>
                  <th colSpan="2">SGST/UTGST</th>
                </>
              ) : (
                <th colSpan="2">IGST</th>
              )}
              <th rowSpan="2" style={{ width: "20%" }}>Total Tax Amount</th>
            </tr>
            <tr>
              {!isIgst ? (
                <>
                  <th className="hsn-tax-subhead" style={{ width: "10%" }}>Rate</th>
                  <th className="hsn-tax-subhead" style={{ width: "15%" }}>Amount</th>
                  <th className="hsn-tax-subhead" style={{ width: "10%" }}>Rate</th>
                  <th className="hsn-tax-subhead" style={{ width: "15%" }}>Amount</th>
                </>
              ) : (
                <>
                  <th className="hsn-tax-subhead" style={{ width: "15%" }}>Rate</th>
                  <th className="hsn-tax-subhead" style={{ width: "20%" }}>Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.values(hsnGroups).map((group, gIdx) => {
              const hsnTax = group.taxAmount;
              return (
                <tr key={gIdx}>
                  <td>{group.hsn}</td>
                  <td>{formatCurrencyNoSymbol(group.taxableValue)}</td>
                  {!isIgst ? (
                    <>
                      <td>{group.gstRate / 2}%</td>
                      <td>{formatCurrencyNoSymbol(hsnTax / 2)}</td>
                      <td>{group.gstRate / 2}%</td>
                      <td>{formatCurrencyNoSymbol(hsnTax / 2)}</td>
                    </>
                  ) : (
                    <>
                      <td>{group.gstRate}%</td>
                      <td>{formatCurrencyNoSymbol(hsnTax)}</td>
                    </>
                  )}
                  <td><strong>{formatCurrencyNoSymbol(hsnTax)}</strong></td>
                </tr>
              );
            })}
            <tr style={{ fontWeight: "bold", background: "#f9fafb" }}>
              <td>Total</td>
              <td>{formatCurrencyNoSymbol(totalTaxableValue)}</td>
              {!isIgst ? (
                <>
                  <td></td>
                  <td>{formatCurrencyNoSymbol(cgstTotal)}</td>
                  <td></td>
                  <td>{formatCurrencyNoSymbol(sgstTotal)}</td>
                </>
              ) : (
                <>
                  <td></td>
                  <td>{formatCurrencyNoSymbol(igstTotal)}</td>
                </>
              )}
              <td>{formatCurrencyNoSymbol(totalTaxes)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Amount in words */}
        <div className="amount-words-block">
          <div className="words-label">Tax Amount (in words) : {taxInWords}</div>
        </div>

        {/* Declaration and Signature footer rows */}
        <div className="invoice-row-flex" style={{ borderBottom: "none" }}>
          <div className="declaration-block">
            <div className="declaration-title">Declaration</div>
            <div>{declaration}</div>
          </div>
          <div className="signature-block">
            <div className="signature-title">for {seller.name || "PREM ENTERPRISES"}</div>
            <div className="signature-line">Authorised Signatory</div>
          </div>
        </div>

        {/* Footer generator disclaimer */}
        <div className="invoice-footer-note">This is a Computer Generated Invoice</div>
      </div>
    </div>
  );
}
