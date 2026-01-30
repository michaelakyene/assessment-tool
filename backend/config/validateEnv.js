const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secrets are strong enough (min 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long for security');
  }

  // Warn if using default secrets
  const dangerousSecrets = [
    'your-super-secret',
    'change-this',
    'your-secret-key',
    'REPLACE_WITH'
  ];

  const hasDangerousSecret = dangerousSecrets.some(dangerous => 
    process.env.JWT_SECRET?.includes(dangerous) || 
    process.env.JWT_REFRESH_SECRET?.includes(dangerous)
  );

  if (hasDangerousSecret) {
    throw new Error('CRITICAL SECURITY ISSUE: JWT secrets contain default/placeholder values. Generate strong secrets using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"');
  }

  console.log('✅ Environment validation passed');
};

module.exports = validateEnv;
