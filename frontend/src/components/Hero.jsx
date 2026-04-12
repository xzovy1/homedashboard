import Calendar from "../components/Calendar"
import Groceries from "../components/Grocery/Groceries"
import classes from "../assets/views/Hero.module.css"

const Hero = ({WidgetContent}) => {
    return(
        <div data-testid="heroSection" className="hero">
            <ul className={classes.carousel} id="carousel"  >
                <li className={classes.slideItem} id="slide_1" data-testid="groceries">
                    <Groceries />
                </li>
                <li className={classes.slideItem} id="slide_2" data-testid="calendar">
                    <Calendar />
                </li>
                <li className={classes.slideItem} id="slide_3" data-testid="widgetContent">
                    <WidgetContent />
                </li>
            </ul>
        </div>
    )
}

export default Hero;