import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark} from "@fortawesome/free-solid-svg-icons";

const Toolbox = () => {
    // const [wifiImg, setWifiImg] = useState("");
    // useEffect(() => {
    //     const URL = import.meta.env.VITE_API_URL + "/wifi"
    //     fetch(URL, {mode: 'cors'}).then(data => {setWifiImg(data)});
    // },[])
    return (
        <div >
            <img src={null} alt="wifiqr" style={{borderRadius: "1em", margin: "1em"}}/>
        </div>
    )
}

export default Toolbox;