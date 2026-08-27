import "./logo.css";

function Logo() {
  return (
    <div className="logo">
      <a href="/">
        <img
          src="/main_logo.png"
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