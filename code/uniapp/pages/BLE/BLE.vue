<template>
    <view class="container">
        <view class="header">
            <text class="title">蓝牙设备连接</text>
        </view>
        <scroll-view
            scroll-y
            class="box"
            @scrolltolower="loadMoreDevices"
        >
            <view class="item" v-for="item in blueDeviceList" :key="item.deviceId" @click="connect(item)">
                <view class="item-content">
                    <text class="device-name">name: {{ item.name || '无名称' }}</text>    
                    <text class="device-id">id: {{ item.deviceId }}</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 搜索到的蓝牙设备列表
const blueDeviceList = ref([])
// 当前蓝牙设备数量
const deviceCount = ref(0)
// 蓝牙设备的id
const deviceId = ref('')
// 硬件提供的服务id
const serviceId = ref('0000ABC0-0000-1000-8000-00805F9B34FB')	//ABC0


// 初始化蓝牙
function initBlue() {
    uni.openBluetoothAdapter({
        success(res) {
            console.log('初始化蓝牙成功', res)
            setTimeout(() => {
                startDiscovery()
            }, 500) // 延时2秒后开始搜索设备
        },
        fail(err) {
            console.error('初始化蓝牙失败', err)
        }
    })
}

// 开始搜索附近设备
function startDiscovery() {
    uni.startBluetoothDevicesDiscovery({
        success(res) {
            console.log('开始搜索设备')
            setTimeout(() => {
                // 每次找到新设备都会触发 found 回调
                uni.onBluetoothDeviceFound(found)
            }, 100) // 延时2秒后开始监听设备
        },
        fail(err) {
            console.error('设备搜索失败', err)
        }
    })
}

// 设备找到时触发的回调
function found(res) {
    console.log('设备发现:', res)
    const newDevices = res.devices || []
    if (newDevices.length > 0) {
        newDevices.forEach(device => {
            // 过滤掉名称为空的设备
            if (device.name && device.name.trim() !== '') {
                // 确保设备不重复添加到列表中
                if (!blueDeviceList.value.some(item => item.deviceId === device.deviceId)) {
                    blueDeviceList.value.push(device)
                    deviceCount.value++
                }
            }
        })
    }
}

// 连接设备
function connect(data) {
    deviceId.value = data.deviceId // 存储设备ID
    setTimeout(() => {
        uni.createBLEConnection({
            deviceId: deviceId.value,
            success(res) {
                console.log('连接成功', res);
                stopDiscovery();  // 停止设备搜索
                // 使用 uni.navigateTo 进行页面跳转，传递设备ID
                // uni.reLaunch({
                //   url: `/pages/index/index?deviceId=${deviceId.value}`
                // });

                uni.showToast({
                    title: '连接成功'
                });
            },
            fail(err) {
                console.log('连接失败', err);
                uni.showToast({
                    title: '连接失败',
                    icon: 'error'
                });
            }
        });
    }, 1000); // 延时1秒后开始连接
}

// 停止设备搜索
function stopDiscovery() {
    uni.stopBluetoothDevicesDiscovery({
        success(res) {
            console.log('停止搜索成功', res)
        },
        fail(err) {
            console.error('停止搜索失败', err)
        }
    })
}

// 页面初始化时调用初始化蓝牙
onMounted(() => {
    initBlue()
})
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  padding: 20rpx;
}	
	
view {
    background-color: #f5f5f5;
}

/* 顶部标题栏 */
.header {
    background-color: #3b8fcd;
    padding: 20px;
    text-align: center;
}
.title {
    font-size: 24px;
    color: white;
}

/* 设备列表 */
.box {
    width: 100%;
    height: calc(100vh - 80px); /* 让列表占满屏幕 */
    box-sizing: border-box;
    padding: 20px;
    overflow-y: scroll;
}

.item {
    box-sizing: border-box;
    margin-bottom: 15px;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.item-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.device-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
}

.device-id {
    font-size: 14px;
    color: #888;
}

/* 触摸反馈效果 */
.item:active {
    background-color: #f0f0f0;
}
</style>
