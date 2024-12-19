"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_qiun_data_charts2 = common_vendor.resolveComponent("qiun-data-charts");
  _easycom_qiun_data_charts2();
}
const _easycom_qiun_data_charts = () => "../../uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.js";
if (!Math) {
  _easycom_qiun_data_charts();
}
const _sfc_main = {
  __name: "test",
  setup(__props) {
    const currentSpeed = common_vendor.ref(50);
    const gaugeData = common_vendor.ref({
      categories: [
        { value: 0.3, color: "#0000FF" },
        // 蓝色：低速
        { value: 0.7, color: "#FFFF00" },
        // 黄色：中速
        { value: 1, color: "#FF0000" }
        // 红色：高速
      ],
      series: [
        { name: "转速", data: currentSpeed.value / 100 }
        // 转速值归一化
      ]
    });
    const gaugeOpts = common_vendor.ref({
      title: { name: `${currentSpeed.value} RPM`, fontSize: 25, color: "#8dc63f" },
      subtitle: { name: "实时转速", fontSize: 15, color: "#8799a3" },
      extra: {
        gauge: {
          type: "progress",
          width: 15,
          startAngle: 0.75,
          // 起始角度
          endAngle: 0.25,
          // 结束角度
          startNumber: 0,
          // 起始刻度值
          endNumber: 100,
          // 结束刻度值
          splitLine: {
            fixRadius: 0,
            splitNumber: 10,
            // 大刻度数量
            width: 15,
            color: "#FFFFFF",
            childNumber: 5,
            // 小刻度数量
            childWidth: 7
          },
          pointer: {
            width: 5,
            // 指针宽度
            color: "auto"
            // 自动匹配颜色
          },
          customColor: [
            { position: 0.3, color: "#0000FF" },
            // 蓝色：低速
            { position: 0.7, color: "#FFFF00" },
            // 黄色：中速
            { position: 1, color: "#FF0000" }
            // 红色：高速
          ],
          labelOffset: 10
        }
      }
    });
    function updateSpeed(event) {
      currentSpeed.value = event.detail.value;
      gaugeData.value.series[0].data = currentSpeed.value / 100;
      gaugeOpts.value.title.name = `${currentSpeed.value} RPM`;
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "gauge",
          opts: gaugeOpts.value,
          chartData: gaugeData.value,
          canvasId: "gaugeChart",
          canvas2d: true
        }),
        b: common_vendor.t(currentSpeed.value),
        c: currentSpeed.value,
        d: common_vendor.o(updateSpeed)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-727d09f0"]]);
wx.createPage(MiniProgramPage);
