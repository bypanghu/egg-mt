// app/controller/home.js
const Controller = require('egg').Controller;
const md5 = require("md5")

class HomeController extends Controller {
  async index() {
    this.ctx.body = md5('this is just test');
  }
}

module.exports = HomeController;