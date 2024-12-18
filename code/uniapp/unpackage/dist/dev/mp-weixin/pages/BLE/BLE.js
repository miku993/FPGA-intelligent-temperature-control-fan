"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "BLE",
  setup(__props) {
    const blueDeviceList = common_vendor.ref([]);
    const deviceId = common_vendor.ref("");
    const serviceId = common_vendor.ref("ABC0");
    const characteristicRX = common_vendor.ref("ABC1");
    const characteristicTX = common_vendor.ref("ABC2");
    function initBlue() {
      common_vendor.index.openBluetoothAdapter({
        success(res) {
          console.log("初始化蓝牙成功", res);
        },
        fail(err) {
          console.log("初始化蓝牙失败", err);
        }
      });
    }
    function discovery() {
      common_vendor.index.startBluetoothDevicesDiscovery({
        success(res) {
          console.log("开始搜索", res);
          common_vendor.index.onBluetoothDeviceFound(found);
        },
        fail(err) {
          console.log("搜索失败", err);
        }
      });
    }
    function found(res) {
      console.log(res);
      blueDeviceList.value = [...new Set(blueDeviceList.value.concat(res.devices))];
    }
    function connect(data) {
      deviceId.value = data.deviceId;
      common_vendor.index.createBLEConnection({
        deviceId: deviceId.value,
        success(res) {
          console.log("连接成功", res);
          stopDiscovery();
          common_vendor.index.showToast({
            title: "连接成功"
          });
          getCharacteristics();
          notify();
        },
        fail(err) {
          console.log("连接失败", err);
          common_vendor.index.showToast({
            title: "连接失败",
            icon: "error"
          });
        }
      });
    }
    function stopDiscovery() {
      common_vendor.index.stopBluetoothDevicesDiscovery({
        success(res) {
          console.log("停止搜索", res);
        },
        fail(err) {
          console.log("停止失败", err);
        }
      });
    }
    function getCharacteristics() {
      common_vendor.index.getBLEDeviceCharacteristics({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        success(res) {
          console.log("获取特征值成功", res);
        },
        fail(err) {
          console.error("获取特征值失败", err);
        }
      });
    }
    function notify() {
      common_vendor.index.notifyBLECharacteristicValueChange({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicTX.value,
        // 监听发送数据的特征
        success(res) {
          console.log("开始监听", res);
          listenValueChange();
          common_vendor.index.showToast({
            title: "已开启监听"
          });
        },
        fail(err) {
          console.error("监听失败", err);
          common_vendor.index.showToast({
            title: "监听失败",
            icon: "error"
          });
        }
      });
    }
    function listenValueChange() {
      common_vendor.index.onBLECharacteristicValueChange((res) => {
        console.log(res);
        let result = ab2hex(res.value);
        message.value = result;
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
    function send() {
      const msg = "hello";
      const buffer = new ArrayBuffer(msg.length);
      const dataView = new DataView(buffer);
      for (let i = 0; i < msg.length; i++) {
        dataView.setUint8(i, msg.charAt(i).charCodeAt());
      }
      common_vendor.index.writeBLECharacteristicValue({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicRX.value,
        // 发送到接收特征
        value: buffer,
        success(res) {
          console.log("发送成功", res);
          common_vendor.index.showToast({
            title: "数据发送成功"
          });
        },
        fail(err) {
          console.error("发送失败", err);
          common_vendor.index.showToast({
            title: "数据发送失败",
            icon: "error"
          });
        }
      });
    }
    const message = common_vendor.ref("");
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(blueDeviceList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.deviceId,
            c: common_vendor.o(($event) => connect(item), item.deviceId)
          };
        }),
        b: common_vendor.o(initBlue),
        c: common_vendor.o(discovery),
        d: common_vendor.o(send),
        e: common_vendor.t(message.value)
      };
    };
  }
};
wx.createPage(_sfc_main);
