import {  useState } from "react";
import axios from "axios";
import { backendUrl } from "../constant";

const AdminPage = () => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [status, setStatus] = useState("");


  const startRegistration = async () => {
    try {
      // Get registration token
      const { data } = await axios.get(`${backendUrl}/lti/generate-token`);
      
      // Build Identific URL
      const openidConfig = encodeURIComponent(
        `${backendUrl}/.well-known/openid-configuration`
      );
      const url = `https://api.identific.com/lti/cartridge?openid_configuration=${openidConfig}&registration_token=${data.token}`;
      
      setIframeSrc(url);
      setStatus("Loading registration form...");
    } catch (err) {
      setStatus("Error starting registration");
    }
  };

  return (
    <div>
      <button onClick={startRegistration}>
        Register with Identific (https://api.identific.com/lti/cartridge)
      </button>

      {iframeSrc && (
        <iframe
          src={iframeSrc}
          title="lti-registration"
          style={{ width: "100%", height: "500px", border: "1px solid #ccc",margin :"10px 0px" }}
          onLoad={() => setStatus("Form loaded - submit credentials in form below")}
        />
      )}

      <div>{status}</div>
    </div>
  );
};

export default AdminPage;

