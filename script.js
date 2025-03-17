function switchMode(mode) {
    const singleInput = document.getElementById('singleInput');
    const multiInput = document.getElementById('multiInput');
    const singleMode = document.getElementById('singleMode');
    const multiMode = document.getElementById('multiMode');
    const linkContainer = document.getElementById('linkContainer');
    const error = document.getElementById('error');

    // Reset state
    error.textContent = '';
    linkContainer.innerHTML = '<div id="linksList"></div>';

    if (mode === 'single') {
        singleInput.style.display = 'flex';
        multiInput.style.display = 'none';
        singleMode.classList.add('active');
        multiMode.classList.remove('active');
    } else {
        singleInput.style.display = 'none';
        multiInput.style.display = 'flex';
        singleMode.classList.remove('active');
        multiMode.classList.add('active');
    }
}

function validateAndCleanNumber(phoneInput) {
    // Remove all spaces and special characters
    let cleanNumber = phoneInput.replace(/[\s\-\(\)]/g, '');

    // Check if the number matches any of the valid formats
    const validFormats = [
        /^\+65\d{8}$/, // +65 XXXXXXXX
        /^65\d{8}$/,   // 65 XXXXXXXX
        /^\d{8}$/      // XXXXXXXX
    ];

    let isValid = validFormats.some(format => format.test(cleanNumber));

    if (!isValid) {
        return null;
    }

    // If number doesn't start with +65 or 65, add 65
    if (cleanNumber.length === 8) {
        cleanNumber = '65' + cleanNumber;
    }
    
    // Ensure it starts with + if it doesn't
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = '+' + cleanNumber;
    }

    return cleanNumber;
}

function generateLink() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const labelInput = document.getElementById('singleLabel').value.trim();
    const errorElement = document.getElementById('error');
    const linksList = document.getElementById('linksList');

    // Reset previous state
    errorElement.textContent = '';
    linksList.innerHTML = '';

    const cleanNumber = validateAndCleanNumber(phoneInput);

    if (!cleanNumber) {
        errorElement.textContent = 'Invalid phone number format. Please check the accepted formats below.';
        return;
    }

    // Generate the WhatsApp link with + symbol
    const waLink = `https://wa.me/+${cleanNumber.substring(1)}`; // Keep the + for the URL
    
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
        <div class="link-content">
            ${labelInput ? `<div class="label">${labelInput}</div>` : ''}
            <div style="font-size: 0.8em; color: #666;">${phoneInput}</div>
            <a href="${waLink}" target="_blank">${waLink}</a>
        </div>
        <button onclick="copyToClipboard('${waLink}', this)">Copy</button>
    `;
    linksList.appendChild(linkItem);
}

function generateMultipleLinks() {
    const multiInput = document.getElementById('multiPhoneNumbers').value;
    const errorElement = document.getElementById('error');
    const linksList = document.getElementById('linksList');
    
    // Reset previous state
    errorElement.textContent = '';
    linksList.innerHTML = '';

    const lines = multiInput.split('\n').filter(line => line.trim() !== '');
    let hasErrors = false;
    let validLinks = [];

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        // Try to find a phone number pattern in the line
        const phoneMatch = trimmedLine.match(/(?:\+65|65)?\s*\d{4}\s*\d{4}|\d{8}/);
        
        if (phoneMatch) {
            const number = phoneMatch[0];
            // The label is everything before the phone number, trimmed
            const label = trimmedLine.substring(0, trimmedLine.indexOf(number)).trim();
            
            const cleanNumber = validateAndCleanNumber(number);
            
            if (!cleanNumber) {
                hasErrors = true;
                const errorItem = document.createElement('div');
                errorItem.className = 'error';
                errorItem.textContent = `Line ${index + 1}: Invalid number format - "${number}"`;
                errorElement.appendChild(errorItem);
            } else {
                // Generate the WhatsApp link with + symbol
                const waLink = `https://wa.me/+${cleanNumber.substring(1)}`;
                validLinks.push({ 
                    label: label,
                    original: number,
                    link: waLink 
                });
            }
        } else {
            hasErrors = true;
            const errorItem = document.createElement('div');
            errorItem.className = 'error';
            errorItem.textContent = `Line ${index + 1}: No valid phone number found - "${trimmedLine}"`;
            errorElement.appendChild(errorItem);
        }
    });

    if (validLinks.length > 0) {
        validLinks.forEach(item => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <div class="link-content">
                    ${item.label ? `<div class="label">${item.label}</div>` : ''}
                    <div style="font-size: 0.8em; color: #666;">${item.original}</div>
                    <a href="${item.link}" target="_blank">${item.link}</a>
                </div>
                <button onclick="copyToClipboard('${item.link}', this)">Copy</button>
            `;
            linksList.appendChild(linkItem);
        });
    }

    if (validLinks.length === 0 && hasErrors) {
        errorElement.insertBefore(
            document.createTextNode('No valid phone numbers found. Please check the formats below.'),
            errorElement.firstChild
        );
    }
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
} 