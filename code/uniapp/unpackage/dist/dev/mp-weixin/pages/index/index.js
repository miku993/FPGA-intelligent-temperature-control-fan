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
    const speedSetting = common_vendor.ref(0);
    const isManualMode = common_vendor.ref(false);
    const deviceId = common_vendor.ref("F80556A6-DA8B-E3BD-48A5-6EFA71CD9FA7");
    const serviceId = common_vendor.ref("0000ABC0-0000-1000-8000-00805F9B34FB");
    const characteristicId_RX = common_vendor.ref("0000ABC1-0000-1000-8000-00805F9B34FB");
    const characteristicId_TX = common_vendor.ref("0000ABC2-0000-1000-8000-00805F9B34FB");
    common_vendor.ref("");
    common_vendor.ref("");
    common_vendor.ref("");
    common_vendor.ref("");
    const receivedData = common_vendor.ref({ temperature: 0, speed: 0 });
    const temperatureData = common_vendor.ref({
      series: [{ name: "温度", data: 0 }]
    });
    const speedData = common_vendor.ref({
      series: [{ name: "转速", data: 0 }],
      categories: [{ color: "#0000FF" }]
    });
    const temperatureOpts = common_vendor.ref({
      update: true,
      dataLabel: false,
      animation: true,
      // 关闭动画
      duration: true,
      // 动画过度
      title: {
        name: "0°C",
        // 主标题
        fontSize: 30,
        color: "#39b54a",
        offsetX: 0,
        offsetY: 0
      },
      subtitle: {
        name: "实时温度",
        // 副标题
        fontSize: 15,
        color: "#8799a3",
        offsetX: 0,
        offsetY: 0
      },
      extra: {
        arcbar: {
          type: "default",
          width: 12,
          backgroundColor: "#E9E9E9",
          startAngle: 0.75,
          endAngle: 0.25,
          gap: 2,
          direction: "cw",
          lineCap: "round",
          centerX: 0,
          centerY: 0,
          linearType: "none"
        }
      }
    });
    const speedOpts = common_vendor.ref({
      update: true,
      dataLabel: false,
      duration: true,
      // 动画过度
      animation: true,
      // 关闭动画
      title: {
        name: "0 RPM",
        // 主标题
        fontSize: 26,
        color: "#39b54a",
        offsetY: 0,
        offsetX: 0
      },
      subtitle: {
        name: "实时转速",
        // 副标题
        fontSize: 15,
        color: "#8799a3",
        offsetY: 0,
        offsetX: 0
      },
      extra: {
        gauge: {
          type: "progress",
          width: 15,
          startAngle: 0.75,
          // 起始角度
          endAngle: 0.25,
          // 结束角度
          startNumber: 500,
          // 起始刻度值
          endNumber: 3800,
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
            width: 20,
            // 指针宽度
            color: "auto"
            // 自动匹配颜色
          },
          labelOffset: 10
        }
      }
    });
    function updateChartData(data) {
      temperatureData.value.series[0].data = data.temperature / 125;
      speedData.value.series[0].data = (data.speed - 500) / 3300;
      temperatureOpts.value.title.name = `${data.temperature}°C`;
      speedOpts.value.title.name = `${data.speed} RPM`;
      console.log("图表数据已更新", temperatureData.value.series[0].data, speedData.value.series[0].data);
    }
    function toggleMode() {
      isManualMode.value = !isManualMode.value;
      const mode = isManualMode.value ? "man" : "auto";
      sendDataToBLE(`{"mode":${mode},"speed":50}`);
    }
    const modeStyle = common_vendor.computed(() => {
      return {
        color: isManualMode.value ? "#d81855" : "#070606"
        // 手动时醒目，自动时蓝色
      };
    });
    const speedStyle = common_vendor.computed(() => {
      return {
        color: isManualMode.value ? "#d81855" : "#070606"
        // 手动时橙红，自动时灰色
      };
    });
    function handleSliderChange(event) {
      speedSetting.value = event.detail.value;
      sendDataToBLE(`{mode:"man",speed:${speedSetting.value}}`);
    }
    common_vendor.index.onBLEConnectionStateChange((res) => {
      console.log("设备连接状态变化", res);
      if (res.connected) {
        setTimeout(() => {
          getServices();
        }, 1e3);
        setTimeout(() => {
          getCharacteristics();
        }, 1e3);
        setTimeout(() => {
          receiveDataFromBLE();
        }, 2e3);
      } else {
        console.log("设备已断开");
      }
    });
    function getServices() {
      common_vendor.index.getBLEDeviceServices({
        deviceId: deviceId.value,
        success(res) {
          console.log("设备ID:", deviceId);
          console.log(res);
        },
        fail(err) {
          console.error(err);
          common_vendor.index.showToast({
            title: "获取服务失败",
            icon: "error"
          });
        }
      });
    }
    function getCharacteristics() {
      common_vendor.index.getBLEDeviceCharacteristics({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        success(res) {
          console.log(res);
        },
        fail(err) {
          console.error(err);
          common_vendor.index.showToast({
            title: "获取特征值失败",
            icon: "error"
          });
        }
      });
    }
    function receiveDataFromBLE() {
      common_vendor.index.notifyBLECharacteristicValueChange({
        state: true,
        // 设置为true表示开启监听 
        deviceId: deviceId.value,
        // 设备ID
        serviceId: serviceId.value,
        // 服务ID
        characteristicId: characteristicId_TX.value,
        // 接收通道的特征值
        success(res) {
          console.log("已开启监听", res);
          listenValueChange();
        },
        fail(err) {
          console.error(err);
        }
      });
    }
    function listenValueChange() {
      common_vendor.index.onBLECharacteristicValueChange((res) => {
        console.log("接收到的BLE数据：", res);
        let resHex = ab2hex(res.value);
        console.log("接收到的十六进制数据：", resHex);
        let result = hexCharCodeToStr(resHex);
        console.log("接收到的字符串数据：", result);
        try {
          const newData = JSON.parse(result);
          console.log("解包后的数据：", newData);
          console.log("Temperature:", newData.temperature);
          console.log("Speed:", newData.speed);
          receivedData.value = newData;
          updateChartData(receivedData.value);
        } catch (error) {
          console.error("解析JSON数据失败:", error);
        }
      });
    }
    function sendDataToBLE(message) {
      console.log("发送数据：", message);
      const buffer = stringToBuffer(message);
      common_vendor.index.writeBLECharacteristicValue({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicId_RX.value,
        // 发送通道的特征值
        value: buffer,
        // 传递转换后的Buffer
        success(res) {
          console.log("发送数据成功", res.errMsg);
        },
        fail(err) {
          console.log("发送数据失败", err.errMsg);
        }
      });
    }
    function stringToBuffer(str) {
      const buffer = new ArrayBuffer(str.length);
      const dataView = new DataView(buffer);
      for (let i = 0; i < str.length; i++) {
        dataView.setUint8(i, str.charAt(i).charCodeAt());
      }
      return buffer;
    }
    function ab2hex(buffer) {
      const hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function(bit) {
          return ("00" + bit.toString(16)).slice(-2);
        }
      );
      return hexArr.join("");
    }
    function hexCharCodeToStr(hexCharCodeStr) {
      var trimedStr = hexCharCodeStr.trim();
      var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
      var len = rawStr.length;
      if (len % 2 !== 0) {
        alert("存在非法字符!");
        return "";
      }
      var curCharCode;
      var resultStr = [];
      for (var i = 0; i < len; i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
      }
      return resultStr.join("");
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
          opts: speedOpts.value,
          chartData: speedData.value,
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
        l: common_vendor.o(handleSliderChange)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
