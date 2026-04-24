import { useEffect } from "react";

const Calendar = () => {
  const ID =
    "0914b87cf9b2178ffd92dc2e09b374a5da1af4b6d72dbf957d6efc5c713e7968@group.calendar.google.com";
  const KEY = "";
  let URL =
    `https://www.googleapis.com/calendar/v3/calendars/${ID}/events?key=${KEY}` +
    "&output=embed";

  const CLIENT_ID =
    "909649312659-vg3r1vnoi5odl1s2vdkfhk0f4nqfk3vb.apps.googleusercontent.com";
  const API_KEY = "";
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
  let tokenClient;
  let gapiInited = false;
  let gisInited = false;

  function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "", // defined later
    });
    gisInited = true;
    maybeEnableButtons();
  }
  function maybeEnableButtons() {
    if (gapiInited && gisInited) {
      document.getElementById("authorize_button").style.visibility = "visible";
    }
  }

  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      document.getElementById("signout_button").style.visibility = "visible";
      document.getElementById("authorize_button").innerText = "Refresh";
      await listUpcomingEvents();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }

  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken("");
      document.getElementById("content").innerText = "";
      document.getElementById("authorize_button").innerText = "Authorize";
      document.getElementById("signout_button").style.visibility = "hidden";
    }
  }

  async function listUpcomingEvents() {
    let response;
    try {
      const request = {
        calendarId: ID,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      };
      response = await gapi.client.calendar.events.list(request);
      console.log(response);
    } catch (err) {
      document.getElementById("content").innerText = err.message;
      return;
    }

    const events = response.result.items;
    if (!events || events.length == 0) {
      document.getElementById("content").innerText = "No events found.";
      return;
    }
    // Flatten to string to display
    const output = events.reduce(
      (str, event) =>
        `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
      "Events:\n",
    );
    document.getElementById("content").innerText = output;
  }

  useEffect(() => {
    const scriptOne = document.createElement("script");
    scriptOne.src = "https://apis.google.com/js/api.js";
    scriptOne.onload = gapiLoaded;
    scriptOne.defer = true;
    scriptOne.classList.add("script");
    document.body.appendChild(scriptOne);

    const scriptTwo = document.createElement("script");
    scriptTwo.src = "https://accounts.google.com/gsi/client";
    scriptTwo.onload = gisLoaded;
    scriptTwo.defer = true;
    scriptTwo.classList.add("script");
    document.body.appendChild(scriptTwo);

    return () => {
      console.log(document.body.children);
      document.body.removeChild(scriptOne);
      document.body.removeChild(scriptTwo);
    };
  }, []);

  return (
    <div className="calendar-container">
      <button id="authorize_button" onClick={handleAuthClick}>
        Authorize
      </button>
      <button id="signout_button" onClick={handleSignoutClick}>
        Sign Out
      </button>
      <pre id="content" style={{ whiteSpace: "pre-wrap" }}></pre>
    </div>
  );
};

export default Calendar;
