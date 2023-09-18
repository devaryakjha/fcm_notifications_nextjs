import { useEffect, useState } from "react";
import useFCMToken from "./useFCMToken";
import { messaging } from "../firebase";
import { MessagePayload, onMessage } from "firebase/messaging";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const fcmmessaging = messaging();
      const unsubscribe = onMessage(fcmmessaging, (payload) => {
        setMessages((messages) => [...messages, payload]);
      });
      return () => unsubscribe();
    }
  }, [fcmToken]);
  return { fcmToken, messages };
};

export default useFCM;
