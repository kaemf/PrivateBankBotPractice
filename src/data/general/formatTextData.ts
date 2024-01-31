export function formattedName(name : String) {
  const words = name.split(' ');

  const formattedWords = words.map(word => {
    const firstLetter = word.charAt(0).toUpperCase(),
      restOfWord = word.slice(1).toLowerCase();
    return firstLetter + restOfWord;
  });

  return formattedWords.join(' ');
};

export function processPhoneNumber(phoneNumber: string): string {
  const cleanedNumber: string = phoneNumber.replace(/\D/g, '');

  if (cleanedNumber.startsWith('38')) {
    return cleanedNumber.slice(3);
  } else if (cleanedNumber.startsWith('+38')) {
    return cleanedNumber.slice(4);
  }

  return cleanedNumber;
}