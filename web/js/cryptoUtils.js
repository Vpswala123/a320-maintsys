// Uses Web Crypto API to sign logbook entries securely in the browser
async function generateSignature(data) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));
    
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert to hex string
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

// Ensure the window object can access it
window.generateSignature = generateSignature;
