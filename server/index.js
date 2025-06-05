import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { backendUrl, mongoDbConnectionUrl } from "./constant.js";

import {
  getJWKS,
  openidConfig,
  generateRegistrationToken,
  handleRegistration,
  getIdToken,
  getLtiTools,
} from "./routes/lti.js";



dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


// MongoDB
mongoose
  .connect(mongoDbConnectionUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// LTI Routes
app.get("/.well-known/jwks.json", getJWKS);
app.get("/.well-known/openid-configuration", openidConfig);
app.post("/lti/register", handleRegistration);
app.get("/lti/generate-token", generateRegistrationToken);
app.post("/mod/lti/auth.php", getIdToken);
app.get("/api/lti-tools",getLtiTools );



app.listen(5000, () => console.log(`Server running on ${backendUrl}`));


