import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
export const Notification = ({ message }) => {
  return (
    <div className="notificationBanner">
      <FontAwesomeIcon icon={faBell} style={{ color: "rgb(253, 89, 89)" }} />
      <span>{message}</span>
    </div>
  );
};

export const NotificationBadge = ({ val }) => {
  return (
    <span className="notificationBadge">
      <strong>{val}</strong>
    </span>
  );
};
