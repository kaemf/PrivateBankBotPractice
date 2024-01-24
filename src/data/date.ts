export default function DateRecord(){    
    const date : Date = new Date(),
        monthFormat = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1),
        dayFormat = (date.getDate() < 10 ? '0' : '') + (date.getDate());
    return `${dayFormat}.${monthFormat}.${date.getFullYear()}`;
}