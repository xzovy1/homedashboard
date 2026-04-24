import { WeatherWidget } from "./Weather/WeatherWidget";
import { MealPlanWidget } from "./MealPlan/MealPlanWidget";
import { TodoWidget } from "./Todo/TodoWidget";

import widgetStyles from "../assets/views/Widget.module.css";
import { useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faEye,
  faToolbox,
  faBagShopping,
} from "@fortawesome/free-solid-svg-icons";
import { focusComponent } from "../utils/focusComponent";

export function focusCarouselWidget() {
  const carouselChildren = document.querySelector("#carousel").children;
  carouselChildren[0].scrollIntoView({
    behaviour: "smooth",
    block: "nearest",
    inline: "center",
  });
}
const WidgetBar = ({
  setWidgetBar,
  widgetBarStatus,
  setWidgetComponentName,
}) => {
  const carouselRef = useRef(null);
  const handleFocus = () => {
    const target = carouselRef.current.children[2];
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <div className="widgetBar" data-testid="widgetBar">
      {widgetBarStatus ? (
        <>
          <div
            className={widgetStyles.widgets}
            onClick={focusCarouselWidget}
            ref={carouselRef}
          >
            <WeatherWidget setWidgetComponentName={setWidgetComponentName} />
            <TodoWidget setWidgetComponentName={setWidgetComponentName} />
            <MealPlanWidget setWidgetComponentName={setWidgetComponentName} />
          </div>
          <div className={widgetStyles.icons}>
            <FontAwesomeIcon
              icon={faEyeSlash}
              onClick={() => {
                localStorage.setItem("widgetBarStatus", false);
                setWidgetBar(false);
              }}
              className={widgetStyles.hideIcon}
            />
            <FontAwesomeIcon
              icon={faToolbox}
              onClick={() => {
                focusComponent(setWidgetComponentName, "Toolbox");
                focusCarouselWidget();
              }}
            />
            <FontAwesomeIcon
              icon={faBagShopping}
              onClick={() => {
                focusComponent(setWidgetComponentName, "Groceries");
                focusCarouselWidget();
              }}
            />
          </div>
        </>
      ) : (
        <FontAwesomeIcon
          icon={faEye}
          onClick={() => {
            localStorage.setItem("widgetBarStatus", true);
            setWidgetBar(true);
          }}
          className={`${widgetStyles.showIcon} widgetBar`}
          data-testid="widgetBar"
        />
      )}
    </div>
  );
};

export default WidgetBar;
