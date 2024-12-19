"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_qiun_data_charts2 = common_vendor.resolveComponent("qiun-data-charts");
  (_easycom_uni_icons2 + _easycom_qiun_data_charts2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_qiun_data_charts = () => "../../uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_qiun_data_charts)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const speedSetting = common_vendor.ref(50);
    const isManualMode = common_vendor.ref(true);
    common_vendor.ref("");
    common_vendor.ref("0000ABC0-0000-1000-8000-00805F9B34FB");
    common_vendor.ref("0000ABC1-0000-1000-8000-00805F9B34FB");
    common_vendor.ref("0000ABC2-0000-1000-8000-00805F9B34FB");
    common_vendor.ref("");
    common_vendor.ref("");
    const temperatureData = common_vendor.ref({ series: [{ name: "温度", data: 0.8 }] });
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
        { name: "转速", data: 0.66 }
        // 转速值归一化
      ]
    });
    const speedData = common_vendor.ref({ series: [{ name: "转速", data: 66 }] });
    const temperatureOpts = common_vendor.ref({
      title: { name: "26°C", fontSize: 30, color: "#39b54a" },
      subtitle: { name: "实时温度", fontSize: 15, color: "#8799a3" },
      extra: { arcbar: { width: 12, startAngle: 0.75, endAngle: 0.25, customColor: ["#fbbd08", "#e54d42"] } }
    });
    const gaugeOpts = common_vendor.ref({
      title: { name: "66 RPM", fontSize: 27, color: "#8dc63f" },
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
    const modeStyle = common_vendor.computed(() => {
      return {
        color: isManualMode.value ? "#D84315" : "#00838F"
        // 手动时醒目，自动时蓝色
      };
    });
    const speedStyle = common_vendor.computed(() => {
      return {
        color: isManualMode.value ? "#FF5722" : "#BDBDBD"
        // 手动时橙红，自动时灰色
      };
    });
    function handleSliderChange(event) {
      speedSetting.value = event.detail.value;
      speedData.value.series[0].data = speedSetting.value;
      gaugeData.value.series[0].data = speedSetting.value / 100;
      gaugeOpts.value.title.name = `${speedSetting.value} RPM`;
      sendDataToESP32(`[mode:man,speed:${speedSetting.value}]`);
    }
    function toggleMode() {
      isManualMode.value = !isManualMode.value;
      const mode = isManualMode.value ? "man" : "auto";
      sendDataToESP32(`[mode:${mode},speed:50]`);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "plusempty",
          size: "25",
          color: "#333"
        }),
        b: common_vendor.p({
          type: "arcbar",
          opts: temperatureOpts.value,
          chartData: temperatureData.value,
          canvasId: "temperatureChart",
          canvas2d: true
        }),
        c: common_vendor.p({
          type: "gauge",
          opts: gaugeOpts.value,
          chartData: gaugeData.value,
          canvasId: "gaugeChart",
          canvas2d: true
        }),
        d: common_vendor.t(isManualMode.value ? "手动" : "自动"),
        e: common_vendor.s(modeStyle.value),
        f: common_vendor.t(speedSetting.value),
        g: common_vendor.s(speedStyle.value),
        h: common_vendor.t(isManualMode.value ? "切换到自动模式" : "切换到手动模式"),
        i: common_vendor.o(toggleMode),
        j: isManualMode.value
      }, isManualMode.value ? {
        k: speedSetting.value,
        l: common_vendor.o(handleSliderChange),
        m: common_vendor.t(speedSetting.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
