import { generateKidFromPublicKey } from "../utils/encryption.js";
import {
  backendUrl,
  PRIVATE_KEY,
  PUBLIC_KEY,
  alg,
  fontEndUrl,
} from "../constant.js";
import { SignJWT, exportJWK, jwtVerify } from "jose";
import { createPrivateKey, createPublicKey } from "crypto";
import LtiTool from "../models/LtiTools.js";
import crypto from "crypto";

const privateKey = createPrivateKey(PRIVATE_KEY);
const publicKey = createPublicKey(PUBLIC_KEY);

// Get JWKS endpoint
export const getJWKS = async (req, res) => {
  const kid = generateKidFromPublicKey();
  const jwk = await exportJWK(publicKey);
  res.json({
    keys: [
      {
        ...jwk,
        kid,
        alg,
        use: "sig",
      },
    ],
  });
};

// OpenID Configuration
export const openidConfig = (req, res) => {
  res.json({
    issuer: backendUrl,
    token_endpoint: `${backendUrl}/lti/token`,
    jwks_uri: `${backendUrl}/.well-known/jwks.json`,
    registration_endpoint: `${backendUrl}/lti/register`,
    response_types_supported: ["id_token"],
    id_token_signing_alg_values_supported: [alg],
    scopes_supported: ["openid"],
    token_endpoint_auth_methods_supported: ["private_key_jwt"],
    token_endpoint_auth_signing_alg_values_supported: ["RS256"]
  });
};

// Generate registration token
export const generateRegistrationToken = async (req, res) => {
  const kid = generateKidFromPublicKey();

  const token = await new SignJWT({
    sub: crypto.randomBytes(12).toString("base64url"),
    scope: "reg",
  })
    .setProtectedHeader({ alg, kid, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  res.json({ token });
};

export const handleRegistration = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid registration token" });
    }
    const token = req.headers.authorization?.split(" ")[1]; // from Bearer token
    // Step 2: Verify JWT registration_token
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    });
    if (payload.scope !== "reg") {
      return res
        .status(403)
        .json({ error: "Invalid scope for registration token" });
    }

    // Step 3: Extract and validate request body
    const {
      jwks_uri,
      redirect_uris,
      client_name,
      initiate_login_uri,
      "https://purl.imsglobal.org/spec/lti-tool-configuration": ltiConfig,
    } = req.body;

    if (
      !jwks_uri ||
      !redirect_uris ||
      !client_name ||
      !initiate_login_uri ||
      !ltiConfig?.target_link_uri
    ) {
      return res
        .status(422)
        .json({ error: "Missing required registration fields" });
    }

    // Step 5: Check if this tool already exists (by login_uri or client_name)
    let tool = await LtiTool.findOne({ initiate_login_uri });

    const client_id = tool?.client_id || payload?.sub;
    const deployment_id = tool?.deployment_id || "1"; // static 1 for temporarily

    if (tool) {
      // Update existing tool
      tool.set({
        jwks_uri,
        redirect_uris,
        client_name,
        initiate_login_uri,
        deployment_id,
        tool_url: ltiConfig.target_link_uri,
        domain: ltiConfig.domain,
      });
    } else {
      // Create new tool
      tool = new LtiTool({
        client_id,
        jwks_uri,
        redirect_uris,
        client_name,
        initiate_login_uri,
        deployment_id,
        tool_url: ltiConfig.target_link_uri,
        domain: ltiConfig.domain,
      });
    }

    await tool.save();

    // Step 6: Return registration response like Moodle
    res.set({
      "Content-Type": "application/json; charset=utf-8",
    });
    return res.status(200).json({
      client_id,
      "https://purl.imsglobal.org/spec/lti-tool-configuration": {
        deployment_id,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Registration failed", detail: err.message });
  }
};

export const getIdToken = async (req, res) => {
  const {
    client_id,
    nonce,
    redirect_uri,
    state
  } = req.body;

  const now = Math.floor(Date.now() / 1000);
  const kid = generateKidFromPublicKey();

  const payload = {
    nonce,
    iat: now,
    exp: now + 600,
    iss: backendUrl,
    aud: client_id,
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "1",
    "https://purl.imsglobal.org/spec/lti/claim/target_link_uri":
      "https://api.identific.com",
    sub: "234",

    "https://purl.imsglobal.org/spec/lti/claim/roles": [
      "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    ],

    "https://purl.imsglobal.org/spec/lti/claim/context": {
      id: "5",
      label: "t2",
      title: "test 2025",
      type: ["CourseSection"],
    },

    "https://purl.imsglobal.org/spec/lti/claim/message_type":
      "LtiResourceLinkRequest",

    "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
      title: "local test",
      description: "",
      id: "46",
    },

    given_name: "Admin",
    family_name: "User",
    name: "Admin User",

    "https://purl.imsglobal.org/spec/lti/claim/ext": {
      user_username: "user1",
      lms: "camu",
    },

    "https://purl.imsglobal.org/spec/lti/claim/launch_presentation": {
      locale: "en",
      document_target: "iframe",
      return_url: `${fontEndUrl}/student`,
    },

    "https://purl.imsglobal.org/spec/lti/claim/tool_platform": {
      product_family_code: "camu",
      version: "1.4",
      guid: "50f69dc3159c7935f26a65a220603f4a",
      name: "camu",
      description: "camu",
    },

    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",

    "https://purl.imsglobal.org/spec/lti/claim/custom": {
      context_id_history: "",
      context_start_date: "2025-06-15T00:00:00.000Z",
      context_end_date: "2025-06-25T00:00:00.000Z",
      resource_link_history: "$ResourceLink.id.history",
      resource_available_start: "$ResourceLink.available.startDateTime",
      resource_available_end: "$ResourceLink.available.endDateTime",
      resource_submission_start: "$ResourceLink.submission.startDateTime",
      resource_submission_end: "$ResourceLink.submission.endDateTime",
    },
  };

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid })
    .sign(privateKey);

  const html = `
    <html>
      <body onload="document.forms[0].submit()">
        <form action="${redirect_uri}" method="POST">
          <input type="hidden" name="id_token" value="${jwt}" />
          <input type="hidden" name="state" value="${state}" />
        </form>
      </body>
    </html>
  `;
  res.send(html);
};

export const getLtiTools = async (req, res) => {
  try {
    const tools = await LtiTool.find({});
    return res.status(200).json({
      data: tools,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "get tools failed", detail: error.message });
  }
};
