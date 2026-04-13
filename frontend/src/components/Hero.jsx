import Calendar from "../components/Calendar"
import classes from "../assets/views/Hero.module.css"

const Hero = ({WidgetContent}) => {
    return(
        <div data-testid="heroSection" className="hero">
            <ul className={classes.carousel} id="carousel"  >
                <li className={classes.slideItem} id="slide_3" data-testid="widgetContent">
                    <WidgetContent />
                </li>
                <li className={classes.slideItem} id="slide_2" data-testid="calendar">
                    <Calendar />
                </li>
            </ul>
        </div>
    )
}

export default Hero;