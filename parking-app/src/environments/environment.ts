// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001/api/v1',
  

  appVersion: '1.0.0-dev',
  logLevel: 'debug',
  
  features: {
    payments: true,
    commissions: true,
    disputes: true,
    returns: true,
    wallet: true,
    notifications: true,
    locationTracking: true,
    googleMapsDirections: true,
    razorpayPayments: true,
    codPayments: true,
    upiPayments: true,
    analytics: true,
    errorReporting: true
  },
  
  payment: {
    minAmount: 10,
    maxAmount: 50000,
    currency: 'INR',
    supportedMethods: ['cod', 'razorpay', 'upi'],
    retryAttempts: 3,
    retryDelayMs: 1000
  },
  
  commission: {
    defaultPercentage: 10,
    payoutFrequencyDays: 1,
    minimumPayoutAmount: 100,
    maximumPayoutAmount: 100000,
    blockedOwnersThreshold: 1000
  },
  
  dispute: {
    maxResolutionDays: 30,
    appealable: true,
    maxAppeals: 2,
    requiresEvidence: true,
    maxEvidenceFiles: 5,
    maxEvidenceSize: 10
  },
  
  return: {
    maxReturnDays: 7,
    requiresEvidence: false,
    autoApprovalThreshold: 100,
    requiresAdminApproval: false
  },
  
  notification: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  },
  
  location: {
    trackingEnabled: true,
    backgroundTracking: true,
    locationUpdateIntervalMs: 10000,
    accuracyThreshold: 50,
    geocodingEnabled: true
  },
  
  analytics: {
    enabled: true,
    trackPageViews: true,
    trackErrors: true,
    sampleRate: 1.0,
    crashReportingEnabled: false
  },
  
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 500,
    baseUrl: 'http://localhost:8001/api/v1'
  },
  
  security: {
    enableCors: true,
    enableCSP: false,
    enableHTTPS: false,
    certificatePinning: false
  },
  
  logging: {
    consoleLogging: true,
    remoteLogging: false,
    logEndpoint: 'http://localhost:8002/api/logs'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

