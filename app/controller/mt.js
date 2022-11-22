const Controller = require('egg').Controller;
const md5 = require("md5")

class MtController extends Controller {
    async aderMeituan(params) {
        if (!params.source)
            throw new Error(this.ctx.request.href + ' 缺少source参数');
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
        if (req.status != 200 || req.data.ret != 0)
            this.logger.error(
                '美团处理异常: ' +
                this.ctx.request.href +
                ' ' +
                JSON.stringify(req.data)
            );
    }
}

module.exports = MtController;