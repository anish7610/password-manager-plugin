export function generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12)); // Using 12 bytes for AES-GCM
}

export function generateSalt() {
    return  window.crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKeyFromPassword(password, salt, iterations, keyLength) {
    const encodedPassword = new TextEncoder().encode(password);
    const derivedKey = await window.crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const key = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: { name: 'SHA-256' },
        },
        derivedKey,
        keyLength * 8
    );
    return key;
}
    

// Function to encrypt a password using the generated encryption key
export async function encryptPassword(password, keyMaterial, iv) {
    // Import the derived key material
    const encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const encodedPassword = new TextEncoder().encode(password);
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        encryptionKey,
        encodedPassword
    );
    return encryptedData;
}

// Function to decrypt an encrypted password using the encryption key
export async function decryptPassword(encryptedPassword, keyMaterial, iv) {
    const encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv, // Use the same IV as used for encryption
        },
        encryptionKey,
        encryptedPassword
    );
    return new TextDecoder().decode(decryptedData);
}

// Function to hash a password using SHA-256
export async function hashPassword(password) {
    const encodedPassword = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedPassword);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


// Example usage:
// (async () => {
//     // Generate encryption key
//     const encryptionKey = await generateEncryptionKey();

//     // Encrypt password
//     const password = 'examplePassword';
//     const encryptedPassword = await encryptPassword(password, encryptionKey);
//     console.log('Encrypted Password:', arrayBufferToBase64(encryptedPassword));

//     // Decrypt password
//     const decryptedPassword = await decryptPassword(encryptedPassword, encryptionKey);
//     console.log('Decrypted Password:', decryptedPassword);
// })();
