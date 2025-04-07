const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

// 檢查必要的環境變量
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'S3_BUCKET_NAME',
  'CLOUD_FRONT_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// 配置 AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// 創建 S3 實例
const S3 = new AWS.S3({
  signatureVersion: 'v4',
  // 如果使用 localstack 進行本地開發，可以設置 endpoint
  ...(process.env.NODE_ENV === 'development' && process.env.S3_ENDPOINT ? {
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: true
  } : {})
});

// 設置 S3 Bucket CORS
const setupBucketCors = async () => {
  const corsParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["PUT", "POST", "DELETE", "GET"],
          AllowedOrigins: [
            "http://localhost:3000",  // 開發環境
            "http://localhost:5173",  // Vite 默認端口
            process.env.FRONTEND_URL || "*"  // 生產環境 URL
          ],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000
        }
      ]
    }
  };

  try {
    await S3.putBucketCors(corsParams).promise();
    console.log('Successfully set bucket CORS');
  } catch (error) {
    console.error('Error setting bucket CORS:', error);
    throw error;
  }
};

// 測試 S3 連接並設置 CORS
const initializeS3 = async () => {
  try {
    // 測試連接
    await S3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log('Successfully connected to S3');

    // 設置 CORS
    await setupBucketCors();
    console.log('S3 initialization completed');
  } catch (error) {
    console.error('Error initializing S3:', error);
    throw error;
  }
};

// 在應用啟動時初始化
initializeS3().catch(console.error);

module.exports = S3;