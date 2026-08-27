import "./logo.css";

function Logo() {
  return (
    <div className="logo">
      <a href="/">
        <img
          src={`${import.meta.env.BASE_URL}main_logo.png`}
          alt="Athecure"
          className="logo-image"
          width={100}
          height={100}
        />
      </a>
    </div>
  );
}

export default Logo;