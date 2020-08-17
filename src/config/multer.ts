import "dotenv/config";

import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import crypto from "crypto";
import aws from "aws-sdk";

const storageTypes = {
  local: multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "temp"),
    filename: (req, file, callback) => {
      const hash = crypto.randomBytes(6).toString("hex");
      file.key = `${hash}-${file.originalname}`;
      callback(null, file.key);
    },
  }),
  s3: multerS3({
    s3: new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
    bucket: "mn-ecoleta",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, callback) => {
      const hash = crypto.randomBytes(6).toString("hex");
      const fileName = `${hash}-${file.originalname}`;
      callback(null, fileName);
    },
  }),
};

export default {
  dest: path.resolve(__dirname, "..", "..", "temp"),
  storage: storageTypes["s3"],
  // storage: multer.diskStorage({
  //   destination: path.resolve(__dirname, "..", "..", "temp"),
  //   filename: (req, file, callback) => {
  //     const hash = crypto.randomBytes(6).toString("hex");
  //     const fileName = `${hash}-${file.originalname}`;
  //     callback(null, fileName);
  //   },
  // }),
  // limits: {
  //   fileSize: 2 * 1024 * 1024,
  // },
  // fileFilter: (req, file, callback) => {
  //   const allowedMimes = ["image/jpeg", "image/png"];
  //   if (allowedMimes.includes(file.mimetype)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Invalid file type."));
  //   }
  // },
};
