function focusComponent(cb, name) {
  cb(name);
  localStorage.setItem("activeComponent", JSON.stringify(name));
}

export { focusComponent };
