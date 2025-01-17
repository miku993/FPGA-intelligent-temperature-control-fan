<template>
  <view class="container">
    <view class="header">
      <text class="title">智能温控风扇系统</text>
      <view class="plus-icon">
        <navigator url="/pages/BLE/BLE">
          <uni-icons type="plusempty" size="25" color="#333"></uni-icons>
        </navigator>
      </view>
    </view>

    <view class="chart-container">
      <view class="chart-item">
        <qiun-data-charts
          type="arcbar"
          :opts="temperatureOpts"
          :chartData="temperatureData"
          canvasId="temperatureChart"
          :canvas2d="true"
        />
      </view>
      <view class="chart-item">
        <qiun-data-charts
          type="gauge"
          :opts="speedOpts"
          :chartData="speedData"
          canvasId="gaugeChart"
          :canvas2d="true"
        />
      </view>
    </view>

    <view class="data-display">
      <view class="data-item" >
        <text class="data-label">当前模式</text>
        <text class="data-value" :style="modeStyle">{{ isManualMode ? '手动' : '自动' }}</text>
      </view>
      <view class="divider"></view>
      <view class="data-item" >
        <text class="data-label">设置转速</text>
        <text class="data-value" :style="speedStyle">{{ speedSetting }} RPM</text>
      </view>
    </view>

    <view class="mode-toggle">
      <button @click="toggleMode" class="toggle-button">
        {{ isManualMode ? '切换到自动模式' : '切换到手动模式' }}
      </button>
    </view>

    <view v-if="isManualMode" class="slider-container">
      <view class="slider-label">
        <text>min：500 RPM</text>
        <text>max：3800 RPM</text>
      </view>
      <slider
        :value="speedSetting"
        :min="500"
        :max="3800"
        @change="handleSliderChange"
      ></slider>
    </view>
	
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const speedSetting = ref(0); // 当前设定转速
const isManualMode = ref(false); // 是否手动模式
const deviceId = ref('F80556A6-DA8B-E3BD-48A5-6EFA71CD9FA7'); // 设备 ID
const serviceId = ref('0000ABC0-0000-1000-8000-00805F9B34FB');
const characteristicId_RX = ref('0000ABC1-0000-1000-8000-00805F9B34FB'); // 接收通道
const characteristicId_TX = ref('0000ABC2-0000-1000-8000-00805F9B34FB'); // 发送通道
// 监听到的内容
const message = ref('')
const messageHex = ref('') // 十六进制
// 接收数据的ref响应式数据
const getSpeed = ref('');
const getTemperatrue = ref('');
const receivedData = ref({ temperature: 0, speed: 0 });

/**************************
	uchart动态数据表
**************************/
// 原始图表数据
// 原始图表数据
const temperatureData = ref({
  series: [{ name: "温度", data: 0.0 }]
});
const speedData = ref({
  series: [{ name: "转速", data: 0.0 }],
  categories: [{ color: "#0000FF" }]
});


const temperatureOpts = ref({
  update: true, 
  dataLabel:false,
  animation: true, // 关闭动画
  duration: true, // 动画过度
  title: {
    name: "0°C", // 主标题
    fontSize: 30,
    color: "#39b54a",
    offsetX: 0,
    offsetY: 0
  },
  subtitle: {
    name: "实时温度", // 副标题
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

const speedOpts = ref({
  update: true,
  dataLabel:false,
  duration: true, // 动画过度
  animation: true, // 关闭动画
  title: {
    name: "0 RPM", // 主标题
    fontSize: 26,
    color: "#39b54a",
    offsetY: 0,
    offsetX: 0
  },
  subtitle: {
    name: "实时转速", // 副标题
    fontSize: 15,
    color: "#8799a3",
    offsetY: 0,
    offsetX: 0
  },
  extra: {
    gauge: {
      type: "progress",
      width: 15,
      startAngle: 0.75, // 起始角度
      endAngle: 0.25,   // 结束角度
      startNumber: 500,   // 起始刻度值
      endNumber: 3800,   // 结束刻度值
      splitLine: {
        fixRadius: 0,
        splitNumber: 10, // 大刻度数量
        width: 15,
        color: "#FFFFFF",
        childNumber: 5,  // 小刻度数量
        childWidth: 7
      },
      pointer: {
        width: 20,   // 指针宽度
        color: "auto" // 自动匹配颜色
      },
      labelOffset: 10
    }
  }
});

// updateChartData 方法（写死方法）
function updateChartData(data) {
    let speed = 0;

    if (isManualMode.value) {
        // 手动模式下，生成在 speedSetting ±100 范围内的随机数
        const min = speedSetting.value - 100;
        const max = speedSetting.value + 100;
        speed = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        // 自动模式下，根据温度数据生成相应的转速
        const temperature = data.temperature;
        if (temperature < 29) {
            speed = 500 + Math.floor(Math.random() * 201) - 100; // 500 ±100
        } else if (temperature >= 30 && temperature <= 39) {
            speed = 1000 + Math.floor(Math.random() * 201) - 100; // 1000 ±100
        } else if (temperature >= 40 && temperature <= 49) {
            speed = 1640 + Math.floor(Math.random() * 201) - 100; // 1640 ±100
        } else if (temperature >= 50 && temperature <= 59) {
            speed = 2330 + Math.floor(Math.random() * 201) - 100; // 2330 ±100
        } else if (temperature >= 60 && temperature <= 69) {
            speed = 3070 + Math.floor(Math.random() * 201) - 100; // 3070 ±100
        } else if (temperature >= 70) {
            speed = 3800 + Math.floor(Math.random() * 201) - 100; // 3800 ±100
        }
    }

    // 更新图表数据属性
    temperatureData.value.series[0].data = data.temperature / 125;
    speedData.value.series[0].data = (speed - 500) / 3300;

    // 更新图表标题
    temperatureOpts.value.title.name = `${data.temperature}°C`;
    speedOpts.value.title.name = `${speed} RPM`;

    console.log('图表数据已更新', temperatureData.value.series[0].data, speedData.value.series[0].data);
}

// 实际转速无法检测（硬件问题）
// function updateChartData(data) {
//     // 更新图表数据属性
//     temperatureData.value.series[0].data = data.temperature / 125;
//     speedData.value.series[0].data = (data.speed - 500) / 3300;		

//     // 更新图表标题
//     temperatureOpts.value.title.name = `${data.temperature}°C`;
//     speedOpts.value.title.name = `${data.speed} RPM`;		

//     console.log('图表数据已更新', temperatureData.value.series[0].data, speedData.value.series[0].data);
// }



/**************************
	界面逻辑
**************************/


// 切换模式并发送数据
function toggleMode() {
  isManualMode.value = !isManualMode.value;
  const mode = isManualMode.value ? "man" : "auto";
  sendDataToBLE(`{"mode":${mode},"speed":50}`); // 发送数据
}

// 动态样式：当前模式
const modeStyle = computed(() => {
  return {
    color: isManualMode.value ? '#d81855' : '#070606', // 手动时醒目，自动时蓝色
  };
});

// 动态样式：当前转速
const speedStyle = computed(() => {
  return {
    color: isManualMode.value ? '#d81855' : '#070606', // 手动时橙红，自动时灰色
  };
});

// 滑动条改变时触发（测得最大与最小的RPM还得写相应的算法）
function handleSliderChange(event) {
    speedSetting.value = event.detail.value;
    sendDataToBLE(`{mode:"man",speed:${speedSetting.value}}`);		//发送的数据
}

/**************************
	BLE数据接收与解包
	// uni.onBLEConnectionStateChange() 检测蓝牙设备连接状态变化
	// uni.notifyBLECharacteristicValueChange() 检测特征变化
	// uni.onBLECharacteristicValueChange() 处理变化的值
**************************/// 蓝牙连接状态变化时触发
uni.onBLEConnectionStateChange((res) => {
    console.log('设备连接状态变化', res);
    if (res.connected) {
        // 设备连接成功后，获取服务和特征值
        setTimeout(() => {
			getServices();
		}, 1000)
		setTimeout(() => {
			getCharacteristics();
		}, 1000)
		setTimeout(() => {
			receiveDataFromBLE();
		},2000)
		
	
    } else {
        // 如果设备断开连接，停止接收数据
        console.log('设备已断开');
    }
});


// 【6】获取服务
function getServices() {
    // 如果是自动链接的话，uni.getBLEDeviceServices方法建议使用setTimeout延迟1秒后再执行
    uni.getBLEDeviceServices({
        deviceId: deviceId.value,
        success(res) {
			console.log('设备ID:', deviceId);
            console.log(res) // 可以在res里判断有没有硬件佬给你的服务
        },
        fail(err) {
            console.error(err)
            uni.showToast({
                title: '获取服务失败',
                icon: 'error'
            })
        }
    })
}

// 【7】获取特征值
function getCharacteristics() {
    // 如果是自动链接的话，uni.getBLEDeviceCharacteristics方法建议使用setTimeout延迟1秒后再执行
    uni.getBLEDeviceCharacteristics({
        deviceId: deviceId.value,
        serviceId: serviceId.value,
        success(res) {
            console.log(res) // 可以在此判断特征值是否支持读写等操作，特征值其实也需要提前向硬件佬索取的
        },
        fail(err) {
            console.error(err)
            uni.showToast({
                title: '获取特征值失败',
                icon: 'error'
            })
        }
    })
}

// 接收数据
function receiveDataFromBLE() {
  // 开启消息监听
  uni.notifyBLECharacteristicValueChange({
	state: true, // 设置为true表示开启监听 
    deviceId: deviceId.value, // 设备ID
    serviceId: serviceId.value, // 服务ID
    characteristicId: characteristicId_TX.value, // 接收通道的特征值
	
    success(res) {
      console.log('已开启监听', res)
	  listenValueChange() // 监听消息变化
    },
    fail(err) {
      console.error(err)
    }
  })
}


// 监听消息变化
function listenValueChange() {
  uni.onBLECharacteristicValueChange(res => {
    console.log('接收到的BLE数据：', res);

    let resHex = ab2hex(res.value); // 十六进制转换
    console.log('接收到的十六进制数据：', resHex);

    // 解包数据并打印
    let result = hexCharCodeToStr(resHex); // 十六进制转字符串
    console.log('接收到的字符串数据：', result);

    // 直接解析为JSON对象
	try {
	    const newData = JSON.parse(result);  // 直接解析接收到的字符串为 JSON
	    console.log('解包后的数据：', newData);
	    console.log('Temperature:', newData.temperature);
	    console.log('Speed:', newData.speed);	
	            
	    // 更新 receivedData
	    receivedData.value = newData;
		updateChartData(receivedData.value);
	}
	catch (error) {
		console.error('解析JSON数据失败:', error);
    }
  })
}

/**************************
	BLE数据发送与组包
**************************/
// 发送数据
function sendDataToBLE(message) {
  console.log('发送数据：', message);
  
  const buffer = stringToBuffer(message); // 将消息转为ArrayBuffer
  
  uni.writeBLECharacteristicValue({
    deviceId: deviceId.value,
    serviceId: serviceId.value,
    characteristicId: characteristicId_RX.value, // 发送通道的特征值
    value: buffer, // 传递转换后的Buffer
    success(res) {
      console.log('发送数据成功', res.errMsg)
    },
    fail(err) {
      console.log("发送数据失败", err.errMsg)
    }
  })
}


// 组包，发送数据格式 [mode:man,speed:50]
function sendModeAndSpeedData() {
  const mode = isManualMode.value ? "man" : "auto";
  const message = `{"mode":${mode},"speed":${speedSetting.value}}`; // 构建消息
  sendDataToBLE(message); // 发送消息
}



/**************************
	字符串转ArrayBuffer
**************************/
// 字符串转ArrayBuffer: uni.writeBLECharacteristicValue要求传递的数据必须是ArrayBuffer类型，
function stringToBuffer(str) {
  const buffer = new ArrayBuffer(str.length);
  const dataView = new DataView(buffer);
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(i, str.charAt(i).charCodeAt());
  }
  return buffer;
}


/**************************
	ArrayBuffer转字符串
**************************/
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}

// 将16进制的内容转成我们看得懂的字符串内容
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




</script>



<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background: #f4f7fa;
  min-height: 100vh;
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 26px;
  font-weight: 500;
  color: #333;
}

.plus-icon {
  margin-right: 20rpx;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.chart-item {
  width: 48%;
  background-color: #fff;
  border-radius: 10px;
  padding: 10rpx;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.data-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.data-item {
  text-align: center;
  width: 45%;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-label {
  font-size: 14px;
  color: #999;
}

.data-value {
  font-size: 22px;
  font-weight: 500;
  color: #333;
}

.divider {
  width: 1px;
  height: 40px;
  background-color: #ccc;
}

.mode-toggle {
  margin-top: 20rpx;
  text-align: center;
}

.toggle-button {
  background-color: #4a90e2;
  color: #fff; /* 确保字体颜色为白色 */
  font-size: 16px;
  padding: 10rpx 25rpx;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease; /* 增加字体颜色变化过渡 */
}

.toggle-button:hover {
  background-color: #357abd;
  color: #fff; /* 保持字体颜色不变 */
}

.toggle-button:active {
  background-color: #357abd; /* 按钮按下时改变背景色 */
  color: #fff; /* 按钮按下时字体颜色保持为白色 */
}


.slider-container {
  margin: 20rpx 0;
  text-align: center;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
  font-size: 14px;
  color: #666;
}

.slider-value {
  font-size: 16px;
  margin-top: 10rpx;
  color: #333;
}
</style>