import { io } from "socket.io-client";

const URL = import.meta.env.PROD ? undefined : import.meta.env.LOCAL_SERVER;

export const socket = io(URL, { auth: { serverOffset: 0 } });
