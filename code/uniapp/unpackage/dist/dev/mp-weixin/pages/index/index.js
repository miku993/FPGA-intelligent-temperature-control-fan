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
    const deviceId = common_vendor.ref("87686B4D-2537-0287-7904-FDDBA2939AA6");
    const serviceId = common_vendor.ref("0000ABC0-0000-1000-8000-00805F9B34FB");
    const characteristicId_RX = common_vendor.ref("0000ABC1-0000-1000-8000-00805F9B34FB");
    const characteristicId_TX = common_vendor.ref("0000ABC2-0000-1000-8000-00805F9B34FB");
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
      sendDataToBLE(`[mode:man,speed:${speedSetting.value}]`);
    }
    function toggleMode() {
      isManualMode.value = !isManualMode.value;
      const mode = isManualMode.value ? "man" : "auto";
      sendDataToBLE(`[mode:${mode},speed:50]`);
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
        deviceId: deviceId.value,
        // 设备ID
        serviceId: serviceId.value,
        // 服务ID
        characteristicId: characteristicId_TX.value,
        // 接收通道的特征值
        state: true,
        // 设置为true表示开启监听
        success(res) {
          console.log("已开启监听", res);
          setTimeout(() => {
            listenValueChange();
          }, 50);
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
        const data = parseReceivedData(result);
        console.log("解包后的数据：", data);
        temperatureData.value.series[0].data = data.temperature;
        speedData.value.series[0].data = data.speed;
        gaugeData.value.series[0].data = data.speed / 100;
        gaugeOpts.value.title.name = `${data.speed} RPM`;
      });
    }
    function parseReceivedData(data) {
      const regex = /mode:(\w+),temperature:(\d+),speed:(\d+)/;
      const match = data.match(regex);
      if (match) {
        return {
          mode: match[1],
          // 自动/手动模式
          temperature: parseInt(match[2]),
          // 温度
          speed: parseInt(match[3])
          // 转速
        };
      } else {
        console.error("无法解析接收到的数据");
      }
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
