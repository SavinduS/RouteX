const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const User = require("../models/User");

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    cb(null, key.getPublicKey());
  });
}

exports.auth0Login = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ message: "Missing Auth0 token" });

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getKey,
        {
          audience: process.env.AUTH0_CLIENT_ID,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ["RS256"],
        },
        (err, payload) => (err ? reject(err) : resolve(payload))
      );
    });

    const email = decoded.email;
    const full_name = decoded.name || "Google User";

    if (!email) return res.status(400).json({ message: "Email not found in token" });

    let user = await User.findOne({ email });

    // Create MongoDB user if not exists
    if (!user) {
      user = await User.create({
        full_name,
        email,
        phone_number: "N/A",     // since Google doesn't give phone
        password_hash: "AUTH0",  // dummy
        role: "entrepreneur",    // default role
        is_verified: true,
      });
    }

    // Issue YOUR app JWT
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google login success",
      token: appToken,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid Auth0 token", error: err.message });
  }
};