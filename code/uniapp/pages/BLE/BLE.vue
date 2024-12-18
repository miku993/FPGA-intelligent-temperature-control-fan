<template>
    <view>
        <!-- 设备列表，只显示设备名称 -->
        <scroll-view
            scroll-y
            class="box"
        >
            <view class="item" v-for="item in blueDeviceList" :key="item.deviceId" @click="connect(item)">
                <view>
                    <text>name: {{ item.name }}</text>    
                </view>
            </view>
        </scroll-view>

        <!-- 操作按钮 -->
        <button @click="initBlue">1 初始化蓝牙</button>
        <button @click="discovery">2 搜索附近蓝牙设备</button>
        <button @click="send">3 发送数据</button>

        <!-- 显示接收到的内容 -->
        <view class="msg_x">
            <view class="msg_txt">
                监听到的内容：{{ message }}
            </view>
        </view>    
    </view>
</template>

<script setup>
import { ref } from 'vue'

// 搜索到的蓝牙设备列表
const blueDeviceList = ref([])

// 设备信息
const deviceId = ref('')
const serviceId = ref('ABC0') // 使用 ESP32 端的服务UUID
const characteristicRX = ref('ABC1') // 接收数据特征UUID
const characteristicTX = ref('ABC2') // 发送数据特征UUID

// 【1】初始化蓝牙
function initBlue() {
    uni.openBluetoothAdapter({
        success(res) {
            console.log('初始化蓝牙成功', res)
        },
        fail(err) {
            console.log('初始化蓝牙失败', err)
        }
    })
}

// 【2】开始搜寻附近设备
function discovery() {
    // 只启动一次设备搜索
    uni.startBluetoothDevicesDiscovery({
        success(res) {
            console.log('开始搜索', res)
            // 开启监听回调
            uni.onBluetoothDeviceFound(found)
        },
        fail(err) {
            console.log('搜索失败', err)
        }
    })
}

// 【3】找到新设备就触发该方法
function found(res) {
    console.log(res)
    // 去重设备列表
    blueDeviceList.value = [...new Set(blueDeviceList.value.concat(res.devices))]
}

// 【4】连接设备
function connect(data) {
    deviceId.value = data.deviceId // 获取设备ID

    uni.createBLEConnection({
        deviceId: deviceId.value,
        success(res) {
            console.log('连接成功', res)
            stopDiscovery()
            uni.showToast({
                title: '连接成功'
            })
            // 获取特征值并开始监听
            getCharacteristics()
            notify()
        },
        fail(err) {
            console.log('连接失败', err)
            uni.showToast({
                title: '连接失败',
                icon: 'error'
            })
        }
    })
}

// 【5】停止搜索
function stopDiscovery() {
    uni.stopBluetoothDevicesDiscovery({
        success(res) {
            console.log('停止搜索', res)
        },
        fail(err) {
            console.log('停止失败', err)
        }
    })
}

// 【6】获取特征值
function getCharacteristics() {
    uni.getBLEDeviceCharacteristics({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        success(res) {
            console.log('获取特征值成功', res)
        },
        fail(err) {
            console.error('获取特征值失败', err)
        }
    })
}

// 【7】开启消息监听
function notify() {
    uni.notifyBLECharacteristicValueChange({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicTX.value, // 监听发送数据的特征
        success(res) {
            console.log('开始监听', res)
            listenValueChange()
            uni.showToast({
                title: '已开启监听'
            })
        },
        fail(err) {
            console.error('监听失败', err)
            uni.showToast({
                title: '监听失败',
                icon: 'error'
            })
        }
    })
}

// 【8】监听消息变化
function listenValueChange() {
    uni.onBLECharacteristicValueChange(res => {
        console.log(res)
        let result = ab2hex(res.value) // 将接收到的数据转换为十六进制
        message.value = result
    })
}

// 16进制转换为字符串
function ab2hex(buffer) {
    const hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('')
}

// 发送数据
function send() {
    const msg = 'hello' // 要发送的数据

    const buffer = new ArrayBuffer(msg.length)
    const dataView = new DataView(buffer)

    // 填充数据
    for (let i = 0; i < msg.length; i++) {
        dataView.setUint8(i, msg.charAt(i).charCodeAt())
    }

    uni.writeBLECharacteristicValue({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        characteristicId: characteristicRX.value, // 发送到接收特征
        value: buffer,
        success(res) {
            console.log('发送成功', res)
            uni.showToast({
                title: '数据发送成功'
            })
        },
        fail(err) {
            console.error('发送失败', err)
            uni.showToast({
                title: '数据发送失败',
                icon: 'error'
            })
        }
    })
}

const message = ref('') // 显示接收到的消息
</script>

<style>
.box {
    width: 98%;
    height: 400rpx;
    box-sizing: border-box;
    margin: 0 auto 20rpx;
    border: 2px solid dodgerblue;
}
.item {
    box-sizing: border-box;
    padding: 10rpx;
    border-bottom: 1px solid #ccc;
}
button {
    margin-bottom: 20rpx;
}

.msg_x {
    border: 2px solid seagreen;
    width: 98%;
    margin: 10rpx auto;
    box-sizing: border-box;
    padding: 20rpx;
}

.msg_x .msg_txt {
    margin-bottom: 20rpx;
}
</style>
