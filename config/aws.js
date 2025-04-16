const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

// 檢查必要的環境變數
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

// 設定 AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// 建立 S3 實例
const S3 = new AWS.S3({
  signatureVersion: 'v4'
});

// 測試 S3 連線
const testS3Connection = async () => {
  try {
    await S3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log('Successfully connected to S3');
  } catch (error) {
    console.error('Error connecting to S3:', error);
    throw error;
  }
};

// 在應用程式啟動時測試連線
testS3Connection().catch(console.error);

module.exports = S3;