export const fetchFeesFromQuote = (quote) => {
    console.log("Quote from Helper:", quote);
    console.log("fee object: ", quote.route.fee);
    if (!quote || !quote.route || !Array.isArray(quote.route.fee)) {
      // throw new Error("Quote is not available or fees are missing.");
      console.error("Quote is not available or fees are missin.");
      return;
    }
  
    // Initialize total fees
    let totalFees = 0;
  
    // Iterate over each fee in the quote and sum up the amounts
    quote.route.fee.forEach(fee => {
      totalFees += parseFloat(fee.amount);
    });
  
    return totalFees;
  };
  