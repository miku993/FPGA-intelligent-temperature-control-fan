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
    const temperatureData = common_vendor.ref({});
    const temperatureOpts = common_vendor.ref({
      title: { name: "26°C", fontSize: 30, color: "#39b54a" },
      subtitle: { name: "实时温度", fontSize: 15, color: "#8799a3" },
      extra: { arcbar: { width: 12, startAngle: 0.75, endAngle: 0.25, customColor: ["#fbbd08", "#e54d42"] } }
    });
    const speedData = common_vendor.ref({});
    const speedOpts = common_vendor.ref({
      title: { name: "66 RPM", fontSize: 27, color: "#8dc63f" },
      subtitle: { name: "实时转速", fontSize: 15, color: "#8799a3" },
      extra: { gauge: { type: "default", width: 15, startNumber: 0, endNumber: 100 } }
    });
    const isManualMode = common_vendor.ref(false);
    const speedSetting = common_vendor.ref(50);
    function handleSliderChange(event) {
      speedSetting.value = event.detail.value;
      speedData.value = { series: [{ name: "转速", data: speedSetting.value }] };
    }
    function toggleMode() {
      isManualMode.value = !isManualMode.value;
    }
    function navigateToBLE() {
      common_vendor.index.navigateTo({ url: "/pages/ble/ble" });
    }
    common_vendor.onMounted(() => {
      temperatureData.value = { series: [{ name: "温度", data: 0.8 }] };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "plusempty",
          size: "25",
          color: "#333"
        }),
        b: common_vendor.o(navigateToBLE),
        c: common_vendor.p({
          type: "arcbar",
          opts: temperatureOpts.value,
          chartData: temperatureData.value,
          canvasId: "temperatureChart",
          canvas2d: true
        }),
        d: common_vendor.p({
          type: "gauge",
          opts: speedOpts.value,
          chartData: speedData.value,
          canvasId: "speedChart",
          canvas2d: true
        }),
        e: common_vendor.t(isManualMode.value ? "切换到自动模式" : "切换到手动模式"),
        f: common_vendor.o(toggleMode),
        g: isManualMode.value
      }, isManualMode.value ? {
        h: speedSetting.value,
        i: common_vendor.o(handleSliderChange),
        j: common_vendor.t(speedSetting.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
