"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "BLE",
  setup(__props) {
    const blueDeviceList = common_vendor.ref([]);
    const deviceCount = common_vendor.ref(0);
    const deviceId = common_vendor.ref("");
    common_vendor.ref("0000ABC0-0000-1000-8000-00805F9B34FB");
    function initBlue() {
      common_vendor.index.openBluetoothAdapter({
        success(res) {
          console.log("初始化蓝牙成功", res);
          setTimeout(() => {
            startDiscovery();
          }, 500);
        },
        fail(err) {
          console.error("初始化蓝牙失败", err);
        }
      });
    }
    function startDiscovery() {
      common_vendor.index.startBluetoothDevicesDiscovery({
        success(res) {
          console.log("开始搜索设备");
          setTimeout(() => {
            common_vendor.index.onBluetoothDeviceFound(found);
          }, 100);
        },
        fail(err) {
          console.error("设备搜索失败", err);
        }
      });
    }
    function found(res) {
      console.log("设备发现:", res);
      const newDevices = res.devices || [];
      if (newDevices.length > 0) {
        newDevices.forEach((device) => {
          if (device.name && device.name.trim() !== "") {
            if (!blueDeviceList.value.some((item) => item.deviceId === device.deviceId)) {
              blueDeviceList.value.push(device);
              deviceCount.value++;
            }
          }
        });
      }
    }
    function connect(data) {
      deviceId.value = data.deviceId;
      setTimeout(() => {
        common_vendor.index.createBLEConnection({
          deviceId: deviceId.value,
          success(res) {
            console.log("连接成功", res);
            stopDiscovery();
            common_vendor.index.reLaunch({
              url: `/pages/index/index?deviceId=${deviceId.value}`
            });
            common_vendor.index.showToast({
              title: "连接成功"
            });
          },
          fail(err) {
            console.log("连接失败", err);
            common_vendor.index.showToast({
              title: "连接失败",
              icon: "error"
            });
          }
        });
      }, 1e3);
    }
    function stopDiscovery() {
      common_vendor.index.stopBluetoothDevicesDiscovery({
        success(res) {
          console.log("停止搜索成功", res);
        },
        fail(err) {
          console.error("停止搜索失败", err);
        }
      });
    }
    common_vendor.onMounted(() => {
      initBlue();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(blueDeviceList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name || "无名称"),
            b: common_vendor.t(item.deviceId),
            c: item.deviceId,
            d: common_vendor.o(($event) => connect(item), item.deviceId)
          };
        }),
        b: common_vendor.o((...args) => _ctx.loadMoreDevices && _ctx.loadMoreDevices(...args))
      };
    };
  }
};
wx.createPage(_sfc_main);
