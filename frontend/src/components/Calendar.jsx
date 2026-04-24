import styles from "../assets/views/Calendar.module.css";
const Calendar = () => {
  const calendarSrc =
    "0914b87cf9b2178ffd92dc2e09b374a5da1af4b6d72dbf957d6efc5c713e7968@group.calendar.google.com";

  return (
    <iframe
      src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarSrc)}&ctz=America/Edmonton`}
      className={styles.calendar}
    />
  );
};

export default Calendar;
