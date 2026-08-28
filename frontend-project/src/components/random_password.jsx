function PasswordGenerator({ onGenerate }) {
  function generateNewPassword() {
    const passwordlegngth = 10;
    const includelowercase = false;
    const includeuppercase = true;
    const includenumber = true;
    const includesymbols = true;

    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const number = "0123456789";
    const syambol = "!@#$%^*()_+-*";

    let allowedChars = "";
    let password = "";

    allowedChars += includelowercase ? lowercase : "";
    allowedChars += includeuppercase ? uppercase : "";
    allowedChars += includenumber ? number : "";
    allowedChars += includesymbols ? syambol : "";

    if (passwordlegngth <= 0) {
      return "(passwrod legnth must be greater than 0)";
    }

    if (allowedChars.length === 0) {
      return "(at least one must be selected)";
    }

    for (let i = 0; i < passwordlegngth; i++) {
      const randomindex = Math.floor(
        Math.random() * allowedChars.length
      );

      password += allowedChars[randomindex];
    }

    onGenerate(password);
  }

  return (
    <button
      type="button"
      className="forgot-password"
      onClick={generateNewPassword}
    >
      Generate new password
    </button>
  );
}

export default PasswordGenerator;