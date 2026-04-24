import { io } from "socket.io-client";

const URL =
  import.meta.env.NODE_ENV === "development"
    ? "http://localhost:5500"
    : undefined;

export const socket = io(URL, { auth: { serverOffset: 0 } });
