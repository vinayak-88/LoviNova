const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token not found");

    const decodedValue = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decodedValue._id) throw new Error("Token invalid");
    if (decodedValue.type !== "auth")
      throw new Error("Invalid token type for this operation");

    const { _id } = decodedValue;
    const user = await UserModel.findById(_id).select(
      "-__v -createdAt -updatedAt"
    );

    if (!user) throw new Error("Please login again");

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { userAuth };
