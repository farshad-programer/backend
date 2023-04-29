import allowedOrigins from "../../config/allowedOrigins.js";
import winston from "winston";

const credentials = (req, res, next) => {
  try {
    const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Controll-Allow-Credentials", true);
  }

  next();
  } catch (err) {
winston.error(err.message, err);
  }
};

export default credentials;
