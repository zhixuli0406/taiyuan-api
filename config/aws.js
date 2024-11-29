const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, // 來自 AWS 訪問憑證
  secretAccessKey: process.env.AWS_SECRET_KEY, // 來自 AWS 訪問憑證
  region: process.env.AWS_REGION, // 例如 'us-east-1'
});

const S3 = new AWS.S3();

module.exports = S3;