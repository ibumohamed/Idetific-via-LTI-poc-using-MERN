import mongoose from "mongoose";

const ltiToolSchema = new mongoose.Schema({
  client_id: { type: String, required: true, unique: true },
  jwks_uri: { type: String, required: true },
  redirect_uris: { type: [String], required: true },
  client_name: String,
  deployment_id: String,
  initiate_login_uri: String,
  tool_url: String,
  domain: String,
  // Include other relevant fields
});

export default mongoose.model("LtiTool", ltiToolSchema);


