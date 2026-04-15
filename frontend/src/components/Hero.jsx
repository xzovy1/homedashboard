import React from "react";
import classes from "../assets/views/Hero.module.css";

const Hero = ({ children }) => {
    const childrenArray = React.Children.toArray(children);

    return (
        <div data-testid="heroSection" className="hero">
            <ul className={classes.carousel} id="carousel">
                {childrenArray.map((child, index) => (
                    <li key={index} className={classes.slideItem}>
                        {child}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Hero;