import controller from "./../controller.js";
import _ from "lodash";

export default new (class extends controller {
  async dashboard(req, res) {
    return this.response({
      res,

      message: "this user already hhhhhhh registered",
    });
  }
})();
