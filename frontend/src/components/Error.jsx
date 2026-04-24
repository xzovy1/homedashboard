const ErrorComponent = ({ error }) => {
  console.log(error);
  return (
    <div>
      <h1>Oh no!</h1>
      <div>An error occurred</div>
      <div>{error.message}</div>
    </div>
  );
};

export default ErrorComponent;
