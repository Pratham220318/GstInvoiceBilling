/**
 * Converts a number into Indian currency words format.
 * E.g., 121895 -> "INR One Lakh Twenty One Thousand Eight Hundred Ninety Five Only"
 * E.g., 18594.18 -> "INR Eighteen Thousand Five Hundred Ninety Four and Eighteen Paise Only"
 */
export function convertNumberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return "";

  // Round to 2 decimal places to avoid floating point issues
  const value = Math.round(num * 100) / 100;
  const parts = value.toString().split(".");
  const rupees = parseInt(parts[0], 10);
  const paise = parts[1] ? parseInt(parts[1].padEnd(2, "0").substring(0, 2), 10) : 0;

  let words = "";

  if (rupees === 0) {
    words = "Zero Rupees";
  } else {
    words = rupeesToWords(rupees);
  }

  // Capitalize first letter of each word
  words = words.trim();

  let paiseWords = "";
  if (paise > 0) {
    paiseWords = rupeesToWords(paise).trim() + " Paise";
  }

  let finalString = "INR " + words;
  if (paiseWords) {
    finalString += " and " + paiseWords;
  }
  finalString += " Only";

  // Normalize spaces
  return finalString.replace(/\s+/g, " ");
}

function rupeesToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "";

  if (num < 20) {
    return a[num] + " ";
  }

  if (num < 100) {
    return b[Math.floor(num / 10)] + " " + a[num % 10] + " ";
  }

  if (num < 1000) {
    // Standard Indian formatting: no "and" before numbers less than 100, or with "and"
    const remainder = num % 100;
    const suffix = remainder ? "and " + rupeesToWords(remainder) : "";
    return a[Math.floor(num / 100)] + " Hundred " + suffix;
  }

  // Indian Numbering System: Thousand (1,000), Lakh (1,00,000), Crore (1,00,00,000)
  if (num < 100000) {
    return rupeesToWords(Math.floor(num / 1000)) + " Thousand " + rupeesToWords(num % 1000);
  }

  if (num < 10000000) {
    return rupeesToWords(Math.floor(num / 100000)) + " Lakh " + rupeesToWords(num % 100000);
  }

  return rupeesToWords(Math.floor(num / 10000000)) + " Crore " + rupeesToWords(num % 10000000);
}
