import { useEffect, useRef, useState } from "react";
import { backendUrl } from "../constant";
import axios from "axios";

function StudentPage() {
  const iframeRef = useRef(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launchUrl, setLaunchUrl] = useState("");

  useEffect(() => {
    axios.get(`${backendUrl}/api/lti-tools`)
      .then((res) => {
        setTools(res.data.data || []);
      })
      .catch((err) => {
        setTools([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLaunch = (tool) => {
    const loginHint = "234";
    // const ltiMessageHint = "launch-identific";

    const params = new URLSearchParams({
      iss: backendUrl,
      client_id: tool.client_id,
      login_hint: loginHint,
      // lti_message_hint: ltiMessageHint,
      target_link_uri: tool.tool_url
    });

    const fullUrl = `${tool.initiate_login_uri}?${params.toString()}`;
    setLaunchUrl(fullUrl);
  };

  return (
    <div>
      <h3>Available LTI Tools</h3>

      {loading ? (
        <p>Loading tools...</p>
      ) : tools.length === 0 ? (
        <p>No tools available</p>
      ) : (
        tools.map((tool, index) => (
          <button
            key={index}
            onClick={() => handleLaunch(tool)}
            style={{ margin: "8px", padding: "8px 16px" }}
          >
            Launch {tool.client_name}
          </button>
        ))
      )}

      {launchUrl && (
        <iframe
          ref={iframeRef}
          src={launchUrl}
          title="LTI Tool"
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #ccc",
            marginTop: "16px",
          }}
        />
      )}
    </div>
  );
}

export default StudentPage;
