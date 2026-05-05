import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Toolbox = () => {
  const [wifiCredentialsImage, setWifiCredentialsImage] = useState(null);
  useEffect(() => {
    const URL = import.meta.env.VITE_API_URL + "/wifi-credentials/QR_Code.png";
    fetch(URL, { mode: "cors" })
      .then((resp) => resp.url)
      .then((data) => {
        setWifiCredentialsImage(data);
      });
  }, []);
  return (
    <div>
      <img
        src={wifiCredentialsImage}
        alt="wifiqr"
        style={{ borderRadius: "1em", margin: "1em" }}
      />
    </div>
  );
};

export default Toolbox;
