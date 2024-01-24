export type Values = {
    flag: string;
    code: string;
};
  
const ExchangeRate: Values[] = [
    { flag: "🇺🇸", code: "USD" },
    { flag: "🇦🇪", code: "AED" },
    { flag: "🇦🇫", code: "AFN" },
    { flag: "🇦🇱", code: "ALL" },
    { flag: "🇦🇲", code: "AMD" },
    { flag: "🇳🇱", code: "ANG" },
    { flag: "🇦🇴", code: "AOA" },
    { flag: "🇦🇷", code: "ARS" },
    { flag: "🇦🇺", code: "AUD" },
    { flag: "🇦🇼", code: "AWG" },
    { flag: "🇦🇿", code: "AZN" },
    { flag: "🇧🇦", code: "BAM" },
    { flag: "🇧🇧", code: "BBD" },
    { flag: "🇧🇩", code: "BDT" },
    { flag: "🇧🇬", code: "BGN" },
    { flag: "🇧🇭", code: "BHD" },
    { flag: "🇧🇮", code: "BIF" },
    { flag: "🇧🇲", code: "BMD" },
    { flag: "🇧🇳", code: "BND" },
    { flag: "🇧🇴", code: "BOB" },
    { flag: "🇧🇷", code: "BRL" },
    { flag: "🇧🇸", code: "BSD" },
    { flag: "🇧🇹", code: "BTN" },
    { flag: "🇧🇼", code: "BWP" },
    { flag: "🇧🇾", code: "BYN" },
    { flag: "🇧🇿", code: "BZD" },
    { flag: "🇨🇦", code: "CAD" },
    { flag: "🇨🇫", code: "CDF" },
    { flag: "🇨🇭", code: "CHF" },
    { flag: "🇨🇱", code: "CLP" },
    { flag: "🇨🇳", code: "CNY" },
    { flag: "🇨🇴", code: "COP" },
    { flag: "🇨🇷", code: "CRC" },
    { flag: "🇨🇺", code: "CUP" },
    { flag: "🇨🇻", code: "CVE" },
    { flag: "🇨🇿", code: "CZK" },
    { flag: "🇩🇯", code: "DJF" },
    { flag: "🇩🇰", code: "DKK" },
    { flag: "🇩🇴", code: "DOP" },
    { flag: "🇩🇿", code: "DZD" },
    { flag: "🇪🇬", code: "EGP" },
    { flag: "🇪🇷", code: "ERN" },
    { flag: "🇪🇹", code: "ETB" },
    { flag: "🇪🇺", code: "EUR" },
    { flag: "🇫🇯", code: "FJD" },
    { flag: "🇫🇰", code: "FKP" },
    { flag: "🇫🇴", code: "FOK" },
    { flag: "🇬🇧", code: "GBP" },
    { flag: "🇬🇪", code: "GEL" },
    { flag: "🇬🇬", code: "GGP" },
    { flag: "🇬🇭", code: "GHS" },
    { flag: "🇬🇮", code: "GIP" },
    { flag: "🇬🇲", code: "GMD" },
    { flag: "🇬🇳", code: "GNF" },
    { flag: "🇬🇹", code: "GTQ" },
    { flag: "🇬🇾", code: "GYD" },
    { flag: "🇭🇰", code: "HKD" },
    { flag: "🇭🇳", code: "HNL" },
    { flag: "🇭🇷", code: "HRK" },
    { flag: "🇭🇹", code: "HTG" },
    { flag: "🇭🇺", code: "HUF" },
    { flag: "🇮🇩", code: "IDR" },
    { flag: "🇮🇱", code: "ILS" },
    { flag: "🇮🇲", code: "IMP" },
    { flag: "🇮🇳", code: "INR" },
    { flag: "🇮🇶", code: "IQD" },
    { flag: "🇮🇷", code: "IRR" },
    { flag: "🇮🇸", code: "ISK" },
    { flag: "🇯🇪", code: "JEP" },
    { flag: "🇯🇲", code: "JMD" },
    { flag: "🇯🇴", code: "JOD" },
    { flag: "🇯🇵", code: "JPY" },
    { flag: "🇰🇪", code: "KES" },
    { flag: "🇰🇬", code: "KGS" },
    { flag: "🇰🇭", code: "KHR" },
    { flag: "🇰🇮", code: "KID" },
    { flag: "🇰🇲", code: "KMF" },
    { flag: "🇰🇷", code: "KRW" },
    { flag: "🇰🇼", code: "KWD" },
    { flag: "🇰🇾", code: "KYD" },
    { flag: "🇰🇿", code: "KZT" },
    { flag: "🇱🇦", code: "LAK" },
    { flag: "🇱🇧", code: "LBP" },
    { flag: "🇱🇰", code: "LKR" },
    { flag: "🇱🇷", code: "LRD" },
    { flag: "🇱🇸", code: "LSL" },
    { flag: "🇱🇾", code: "LYD" },
    { flag: "🇲🇦", code: "MAD" },
    { flag: "🇲🇩", code: "MDL" },
    { flag: "🇲🇬", code: "MGA" },
    { flag: "🇲🇰", code: "MKD" },
    { flag: "🇲🇲", code: "MMK" },
    { flag: "🇲🇳", code: "MNT" },
    { flag: "🇲🇴", code: "MOP" },
    { flag: "🇲🇷", code: "MRU" },
    { flag: "🇲🇺", code: "MUR" },
    { flag: "🇲🇻", code: "MVR" },
    { flag: "🇲🇼", code: "MWK" },
    { flag: "🇲🇽", code: "MXN" },
    { flag: "🇲🇾", code: "MYR" },
    { flag: "🇲🇿", code: "MZN" },
    { flag: "🇳🇦", code: "NAD" },
    { flag: "🇳🇬", code: "NGN" },
    { flag: "🇳🇮", code: "NIO" },
    { flag: "🇳🇴", code: "NOK" },
    { flag: "🇳🇵", code: "NPR" },
    { flag: "🇳🇿", code: "NZD" },
    { flag: "🇴🇲", code: "OMR" },
    { flag: "🇵🇦", code: "PAB" },
    { flag: "🇵🇪", code: "PEN" },
    { flag: "🇵🇬", code: "PGK" },
    { flag: "🇵🇭", code: "PHP" },
    { flag: "🇵🇰", code: "PKR" },
    { flag: "🇵🇱", code: "PLN" },
    { flag: "🇵🇾", code: "PYG" },
    { flag: "🇶🇦", code: "QAR" },
    { flag: "🇷🇴", code: "RON" },
    { flag: "🇷🇸", code: "RSD" },
    { flag: "🇷🇺", code: "RUB" },
    { flag: "🇷🇼", code: "RWF" },
    { flag: "🇸🇦", code: "SAR" },
    { flag: "🇸🇧", code: "SBD" },
    { flag: "🇸🇨", code: "SCR" },
    { flag: "🇸🇩", code: "SDG" },
    { flag: "🇸🇪", code: "SEK" },
    { flag: "🇸🇬", code: "SGD" },
    { flag: "🇸🇭", code: "SHP" },
    { flag: "🇸🇱", code: "SLE" },
    { flag: "🇸🇱", code: "SLL" },
    { flag: "🇸🇴", code: "SOS" },
    { flag: "🇸🇷", code: "SRD" },
    { flag: "🇸🇸", code: "SSP" },
    { flag: "🇸🇹", code: "STN" },
    { flag: "🇸🇾", code: "SYP" },
    { flag: "🇸🇿", code: "SZL" },
    { flag: "🇹🇭", code: "THB" },
    { flag: "🇹🇯", code: "TJS" },
    { flag: "🇹🇲", code: "TMT" },
    { flag: "🇹🇳", code: "TND" },
    { flag: "🇹🇴", code: "TOP" },
    { flag: "🇹🇷", code: "TRY" },
    { flag: "🇹🇹", code: "TTD" },
    { flag: "🇹🇻", code: "TVD" },
    { flag: "🇹🇼", code: "TWD" },
    { flag: "🇹🇿", code: "TZS" },
    { flag: "🇺🇦", code: "UAH" },
    { flag: "🇺🇬", code: "UGX" },
    { flag: "🇺🇾", code: "UYU" },
    { flag: "🇺🇿", code: "UZS" },
    { flag: "🇻🇪", code: "VES" },
    { flag: "🇻🇳", code: "VND" },
    { flag: "🇻🇺", code: "VUV" },
    { flag: "🇼🇸", code: "WST" },
    { flag: "🇨🇫", code: "XAF" },
    { flag: "🇪🇨", code: "XCD" },
    { flag: "🇮🇳", code: "XDR" },
    { flag: "🇧🇫", code: "XOF" },
    { flag: "🇵🇫", code: "XPF" },
    { flag: "🇾🇪", code: "YER" },
    { flag: "🇿🇦", code: "ZAR" },
    { flag: "🇿🇲", code: "ZMW" },
    { flag: "🇿🇼", code: "ZWL" }
];

export default ExchangeRate as Values[];