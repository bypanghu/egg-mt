const Controller = require('egg').Controller;
const md5 = require("md5")

class MtController extends Controller {
    async aderMeituan(params) {
        this.logger.info("----- 美团上报 node 层 处理开始 ↓ -----")
        if (!params.source){
            this.ctx.body = { code: 300, data : "缺少source参数" };
            this.ctx.status =  200;
            return
        }
            
        let feedback_base_url = `https://admspi.zystarlink.com/mt/mtOcpxActivate`
        const source = params.source;
        delete params['source'];
        const { oaid, oaid_md5, imei, imei_md5, ts } = params;
        // let feedback_url =
        //     this.ctx.request.href.split('?')[0].replace('click', 'feedback') + '?';
        // for (const key in params) {
        //     feedback_url += '&' + key + '=' + params[key];
        // }
        let feedback_url = `${feedback_base_url}?mtName=${params.mtName}&clickId=${params.clickId}`
        const reqData = {
            source: source,
            feedback_url: encodeURIComponent(feedback_url),
        };
        if (imei || imei_md5) {
            imei && (reqData.md5_imei = md5(imei).toLowerCase());
            imei_md5 && (reqData.md5_imei = imei_md5.toLowerCase());
        } else {
            oaid && (reqData.md5_oaid = md5(oaid).toLowerCase());
            oaid_md5 && (reqData.md5_oaid = oaid_md5.toLowerCase());
        }
        reqData.action_time = ts ? ts : Date.now();
        let url =
            'https://apimobile.meituan.com/prom/v2/verify?app_type=android&app=group&coderesp=true&mt_channel=meituanunion';
        for (const key in reqData) {
            url += '&' + key + '=' + reqData[key];
        }
        const req = await this.ctx.curl(url, { dataType: 'json', timeout: 30000 });
        if (req.status != 200 || req.data.ret != 0){
            this.logger.error(
                '美团处理异常: ' +
                this.ctx.request.href +
                ' ' +
                JSON.stringify(req.data)
            );
            this.logger.info("-----美团上报 node 层 处理 结束 ↑ -----")
            this.ctx.body = { code: 300, data : "上传失败" };
            this.ctx.status =  200;
            return  
        }else{
            this.logger.info(`------美团上传成功------ url ====> ${url}`)
            this.logger.info("-----美团上报 node 层 处理 结束 ↑ -----")
            this.ctx.body = { code: 200, data : "上传成功" };
            this.ctx.status =  200;
            return
        }
            
    }
}

module.exports = MtController;