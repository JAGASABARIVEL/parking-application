export const environment = {
  production: true,
  apiUrl: 'http://localhost:8001/api/v1',
  

  // App Configuration
  appVersion: '1.0.0',
  logLevel: 'error', // 'debug', 'info', 'warn', 'error'
  
  // Feature Flags
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
  
  // Payment Configuration
  payment: {
    minAmount: 50,
    maxAmount: 100000,
    currency: 'INR',
    supportedMethods: ['cod', 'razorpay', 'upi'],
    retryAttempts: 3,
    retryDelayMs: 5000
  },
  
  // Commission Configuration
  commission: {
    defaultPercentage: 10,
    payoutFrequencyDays: 7,
    minimumPayoutAmount: 500,
    maximumPayoutAmount: 100000,
    blockedOwnersThreshold: 5000
  },
  
  // Dispute Configuration
  dispute: {
    maxResolutionDays: 30,
    appealable: true,
    maxAppeals: 2,
    requiresEvidence: true,
    maxEvidenceFiles: 5,
    maxEvidenceSize: 10 // MB
  },
  
  // Return Configuration
  return: {
    maxReturnDays: 7,
    requiresEvidence: true,
    autoApprovalThreshold: 500,
    requiresAdminApproval: true
  },
  
  // Notification Configuration
  notification: {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  },
  
  // Location Configuration
  location: {
    trackingEnabled: true,
    backgroundTracking: true,
    locationUpdateIntervalMs: 30000,
    accuracyThreshold: 100, // meters
    geocodingEnabled: true
  },
  
  // Analytics
  analytics: {
    enabled: true,
    trackPageViews: true,
    trackErrors: true,
    sampleRate: 1.0,
    crashReportingEnabled: true
  },
  
  // API Configuration
  api: {
    timeout: 30000, // ms
    retryAttempts: 3,
    retryDelay: 1000, // ms
    baseUrl: 'https://api.parkingapp.com/api/v1'
  },
  
  // Security
  security: {
    enableCors: true,
    enableCSP: true,
    enableHTTPS: true,
    certificatePinning: false
  },
  
  // Logging
  logging: {
    consoleLogging: false,
    remoteLogging: true,
    logEndpoint: 'https://logs.parkingapp.com/api/logs'
  }
};