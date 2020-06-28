

class TafHelper {

  /**
   * 将配置文件转换为json对象
   * @param string configPath 
   * @param string encoding = utf8
   * @return json对象
   */
  static getConfig(configPath, encoding = 'utf8') {
    const Utils = require('@taf/taf-utils');
    const config = new Utils.Config();
    config.parseFile(configPath, encoding);
    return config.data;
  }

  /**
   * 获取一个可以操作Dcache的对象
   * @param string proxyObj DCacheServerTarget
   * @param string moduleName moduleName
   */
  static linkCache(proxyObj, moduleName) {
    const DCache = require('@taf/taf-dcache-helper');
    return new DCache({
      proxy: proxyObj,
      allowProxy: true,
      moduleName,
    });
  }

  static getProxy(proxyHandler, objName) {
    const Client = require("@taf/taf-rpc").client;
    return Client.stringToProxy(proxyHandler, objName);
  }

  static async onConfigPushed() {
    const TafConfig = require("@taf/taf-config");
    const config = new TafConfig();
    return new Promise((resolve, reject) => {
      config.on("configPushed", async (filename) => {
        try {
          let data = await config.loadConfig(filename, { format: config.FORMAT.JSON })
          resolve(data);
        }
        catch (e) {
          
          reject(e);
        }
      });
    })
  }

  static getLogger(type, name) {
    const TafLog = require('@taf/taf-logs');
    return new TafLog(type, name)
  }


  /**
   * 启动taf服务
   * @param object imp 类似示例代码的require("./NodeJsCommImp.js").TRom.NodeJsCommImp
   * @param {*} configPath 本地调试用配置文件路径
   */
  static createTafServer(imp, configPath = "") {
    const Taf = require("@taf/taf-rpc");

    Taf.server.getServant(process.env.TAF_CONFIG || configPath).forEach(function (config) {
      let svr, map = {};
      Reflect.set(map, config.servant, imp);
      svr = Taf.server.createServer(map[config.servant]);
      svr.start(config);
      console.log(`start taf server: ${config.servant} at ${config.endpoint}`);
    });

  }

  /**
   * 启动taf服务2, conf文件中必须有client字段,某则会报错
   * @param object imp 类似示例代码的require("./NodeJsCommImp.js").TRom.NodeJsCommImp
   * @param string servant的名字
   * @param {*} configPath 本地调试用配置文件路径
   */
  static createTafServer2(imp, configPath = "", servantName) {
    const Taf = require("@taf/taf-rpc");

    const svr = new Taf.server();
    let servant = ""
    svr.initialize(process.env.TAF_CONFIG || configPath, function (server) {
      servant = server.Application + "." + server.ServerName + "." + servantName;
      server.addServant(imp, servant);
    });

    svr.start();
    console.log(`start taf server: ${servant}`);
  }

  // static async notifyLogicServer() {
  //   // Taf通知：更新logic端加载数据库到内存
  //   const adLogicObj = "AD.adLogicServer.adLogicObj";const TafCmd = require('../proxy/tafCmd');
  //   const lib = require("../lib");
  //   const adLogicReloadMemCMD = "reloadMem";

  //   try {
  //     let result = await TafCmd.notifySrv(adLogicObj, adLogicReloadMemCMD)
  //     lib.logger.notify.info('notify ok', result);
  //     debug('notify ok', result);
  //   }
  //   catch(err) {
  //     lib.logger.notify.error("notify fail", err);
  //     debug("notify fail", err);
  //   }
  // }
}


module.exports = TafHelper;