import controller from "./../controller.js";
import _ from "lodash";
import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";

export default new (class extends controller {
  async register(req, res) {
    let user = await this.User.findOne({ email: req.body.email });
    if (user) {
      return this.response({
        res,
        code: 400,
        message: "this user already registered",
      });
    }
    // const {email, name, password} = req.body;
    // user = new this.User({email, name, password});
    user = new this.User(_.pick(req.body, ["name", "email", "password"]));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    this.response({
      res,
      message: "the user successfuly registered",
      data: _.pick(user, ["_id", "name", "email"]),
    });
  }

  async login(req, res) {
    const cookies = req.cookies;
    const user = await this.User.findOne({ email: req.body.email }).exec();
    if (!user) {
      return this.response({
        res,
        code: 400,
        message: "invalid eamil or password",
      });
    }
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return this.response({
        res,
        code: 401,
        message: "invalid eamil or password",
      });
    }
    const accessToken = jwt.sign(
      {
        userInfo: { _id: user.id },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    const newRefreshToken = jwt.sign(
      {
        _id: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // -----------------------------------------
    let newRefreshTokenArray = !cookies?.jwt
      ? user.refreshToken
      : user.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await user.findOne({ refreshToken }).exec();
      if (!foundToken) {
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24,
    });
    // ---------------------------------------------
    this.response({
      res,
      message: "successfuly logged in",
      data: { accessToken },
    });

    // const token = jwt.sign({ _id: user.id }, config.get("jwt_key"));
  }

  async logout(req, res) {
    const { cookies } = req;
    if (!cookie?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;
    const user = await this.User.findOne({ refreshToken }).exec();
    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return this.response({
        res,
        code: 204,
        message: "invalid token",
      });
    }
    const newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== refreshToken
    );
    user.refreshToken = newRefreshTokenArray;
    await user.save();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    this.response({ res, code: 204, message: "successfuly logged out" });
  }
  async handleRefreshToken (req, res) {
    const cookies = req.cookies;
  
    if (!cookies?.jwt) return res.sendStatus(401);
  
    const refreshToken = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  
    const foundUser = await this.User.findOne({ refreshToken }).exec();
  
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return;
  
          const hackedUser = await User.findOne({
            _id: decoded._id,
          }).exec();
  
          hackedUser.refreshToken = [];
          await hackedUser.save();
        }
      );
      return res.sendStatus(403);
    }
  
    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );
  
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          foundUser.refreshToken = [...newRefreshTokenArray];
          await foundUser.save();
        }
  
        if (err || foundUser._id !== decoded._id)
          return res.sendStatus(403);
  
        const accessToken = jwt.sign(
          {
            userInfo: { _id: decoded._id},
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" }
        );
  
        const newRefreshToken = jwt.sign(
          { _id: foundUser._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
  
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();
  
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
        });
  
        res.json({  accessToken });
      }
    );
  };
})();
