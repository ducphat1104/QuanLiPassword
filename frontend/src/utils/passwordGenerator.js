export const generatePassword = (options) => {
    const {
        length = 16,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = true
    } = options || {};

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let allChars = '';
    let guaranteedChars = [];

    if (includeUppercase) {
        allChars += uppercaseChars;
        guaranteedChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
    }
    if (includeLowercase) {
        allChars += lowercaseChars;
        guaranteedChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    }
    if (includeNumbers) {
        allChars += numberChars;
        guaranteedChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
    if (includeSymbols) {
        allChars += symbolChars;
        guaranteedChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }

    if (allChars === '') {
        return ''; // Return empty if no character types are selected
    }

    let password = guaranteedChars.join('');
    const remainingLength = length - password.length;

    for (let i = 0; i < remainingLength; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to ensure guaranteed characters are not always at the start
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};
