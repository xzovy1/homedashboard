import { io } from "socket.io-client";

const URL = import.meta.env.PROD ? undefined : "http://localhost:5500";
export const socket = io(URL, { auth: { serverOffset: 0 } });
