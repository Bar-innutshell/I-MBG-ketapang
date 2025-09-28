function checkAdmin(req, res, next) {
  const { adminSecret } = req.body;

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Akses ditolak: password salah!" });
  }

  next();
}

module.exports = checkAdmin;
