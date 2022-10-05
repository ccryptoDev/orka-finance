// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    salesapiurl: 'https://orka-salesapi.alchemylms.com/',
    adminapiurl: 'https://orka-adminapi.alchemylms.com/',
    borrowerapiurl: 'https://orka-clientapi.alchemylms.com/',
    installerapiurl: 'https://orka-partnerapi.alchemylms.com/',
    plaidApiVersion: 'v2',
    plaidEnv: 'sandbox', //sandbox|development|production
    plaid_public_key: 'e38d2013e37ebdb8532f5db5d337b8',
    de: 'https://de.alchemylms.com/orka/creditscore',
    mobilePhonePattern: '^((\\+91-?)|0)?[0-9]{1,15}$',
    validPasswordPattern: '^(?=.*?[a-z])(.{13,}|(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,12})$',
    decimalPattern: '[+-]?([0-9]*[.])?[0-9]+',
    textPattern: '^[a-zA-Z]+$',
  };
  export const readyMade = {
    pattern: {
      email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/,
      //email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      decimal: /^[0-9]\d*(\.\d+)?$/,
      number: /^[0-9]*$/,
      // url: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
      // url: /(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      url: /()[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      commaSeprateForVal: /\B(?=(\d{3})+(?!\d))/g,
    },
  };
  
  /*
   * For easier debugging in development mode, you can import the following file
   * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
   *
   * This import should be commented out in production mode because it will have a negative impact
   * on performance if an error is thrown.
   */
  // import 'zone.js/dist/zone-error';  // Included with Angular CLI.
  