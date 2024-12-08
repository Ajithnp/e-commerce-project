function generateReceiptId() {
    // Get the current timestamp
    const timestamp = Date.now().toString(); 

    // Generate a random alphanumeric string of length 6
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Combine timestamp and random string
    const receiptId = `REC-${timestamp}-${randomString}`;
    
    return receiptId;
}

module.exports = generateReceiptId;