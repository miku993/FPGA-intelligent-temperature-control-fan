"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "BLE",
  setup(__props) {
    const blueDeviceList = common_vendor.ref([]);
    function initBlue() {
      common_vendor.index.openBluetoothAdapter({
        success(res) {
          console.log("初始化蓝牙成功");
          console.log(res);
        },
        fail(err) {
          console.log("初始化蓝牙失败");
          console.error(err);
        }
      });
    }
    function discovery() {
      common_vendor.index.startBluetoothDevicesDiscovery({
        success(res) {
          console.log("开始搜索");
          common_vendor.index.onBluetoothDeviceFound(found);
        },
        fail(err) {
          console.log("搜索失败");
          console.error(err);
        }
      });
    }
    function found(res) {
      console.log(res);
      blueDeviceList.value.push(res.devices[0]);
    }
    const deviceId = common_vendor.ref("");
    function connect(data) {
      console.log(data);
      deviceId.value = data.deviceId;
      common_vendor.index.createBLEConnection({
        deviceId: deviceId.value,
        success(res) {
          console.log("连接成功");
          console.log(res);
          stopDiscovery();
          common_vendor.index.showToast({
            title: "连接成功"
          });
        },
        fail(err) {
          console.log("连接失败");
          console.error(err);
          common_vendor.index.showToast({
            title: "连接成功",
            icon: "error"
          });
        }
      });
    }
    function stopDiscovery() {
      common_vendor.index.stopBluetoothDevicesDiscovery({
        success(res) {
          console.log("停止成功");
          console.log(res);
        },
        fail(err) {
          console.log("停止失败");
          console.error(err);
        }
      });
    }
    function getServices() {
      common_vendor.index.getBLEDeviceServices({
        deviceId: deviceId.value,
        success(res) {
          console.log(res);
          common_vendor.index.showToast({
            title: "获取服务成功"
          });
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
    const serviceId = common_vendor.ref("0000ABC0-0000-1000-8000-00805F9B34FB");
    function getCharacteristics() {
      common_vendor.index.getBLEDeviceCharacteristics({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        success(res) {
          console.log(res);
          common_vendor.index.showToast({
            title: "获取特征值成功"
          });
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
    const characteristicId_TX = common_vendor.ref("0000ABC2-0000-1000-8000-00805F9B34FB");
    const characteristicId_RX = common_vendor.ref("0000ABC1-0000-1000-8000-00805F9B34FB");
    function notify() {
      common_vendor.index.notifyBLECharacteristicValueChange({
        deviceId: deviceId.value,
        // 设备id
        serviceId: serviceId.value,
        // 监听指定的服务
        characteristicId: characteristicId_TX.value,
        // 监听对应的特征值
        state: true,
        // 开启监听
        success(res) {
          console.log(res);
          listenValueChange();
          common_vendor.index.showToast({
            title: "已开启监听"
          });
        },
        fail(err) {
          console.error(err);
          common_vendor.index.showToast({
            title: "监听失败",
            icon: "error"
          });
        }
      });
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
    const message = common_vendor.ref("");
    const messageHex = common_vendor.ref("");
    function listenValueChange() {
      common_vendor.index.onBLECharacteristicValueChange((res) => {
        console.log(res);
        let resHex = ab2hex(res.value);
        console.log(resHex);
        messageHex.value = resHex;
        let result = hexCharCodeToStr(resHex);
        console.log(String(result));
        message.value = String(result);
      });
    }
    function send() {
      let msg = "[mode:man,speed:50]";
      const buffer = new ArrayBuffer(msg.length);
      const dataView = new DataView(buffer);
      for (var i = 0; i < msg.length; i++) {
        dataView.setUint8(i, msg.charAt(i).charCodeAt());
      }
      common_vendor.index.writeBLECharacteristicValue({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicId_RX.value,
        value: buffer,
        success(res) {
          console.log("writeBLECharacteristicValue success", res.errMsg);
          common_vendor.index.showToast({
            title: "write指令发送成功"
          });
        },
        fail(err) {
          console.error(err);
          common_vendor.index.showToast({
            title: "write指令发送失败",
            icon: "error"
          });
        }
      });
    }
    function read() {
      common_vendor.index.readBLECharacteristicValue({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicId_TX.value,
        success(res) {
          console.log(res);
          common_vendor.index.showToast({
            title: "read指令发送成功"
          });
        },
        fail(err) {
          console.error(err);
          common_vendor.index.showToast({
            title: "read指令发送失败",
            icon: "error"
          });
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(blueDeviceList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.deviceId),
            b: common_vendor.t(item.name),
            c: common_vendor.o(($event) => connect(item))
          };
        }),
        b: common_vendor.o(initBlue),
        c: common_vendor.o(discovery),
        d: common_vendor.o(getServices),
        e: common_vendor.o(getCharacteristics),
        f: common_vendor.o(notify),
        g: common_vendor.o(send),
        h: common_vendor.o(read),
        i: common_vendor.t(message.value),
        j: common_vendor.t(messageHex.value)
      };
    };
  }
};
wx.createPage(_sfc_main);
