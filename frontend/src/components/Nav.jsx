import styles from "../assets/views/Nav.module.css";

const Nav = ({ setActiveComponentName, components }) => {
  return (
    <div
      className={styles.nav}
      style={{ gridTemplateColumns: `repeat(${components.length}, 1fr)` }}
    >
      {components.map((component) => {
        return (
          <div
            key={component.id}
            className={styles.navItem}
            onClick={() => {
              localStorage.setItem(
                "activeComponent",
                JSON.stringify(component.name),
              );
              setActiveComponentName(component.name);
            }}
          >
            {component.name}
          </div>
        );
      })}
    </div>
  );
};

export default Nav;
