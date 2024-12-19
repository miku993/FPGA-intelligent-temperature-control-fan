<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">智能温控系统</text>
      <!-- 右上角 "+" 图标 -->
      <view @click="navigateToBLE" class="plus-icon">
        <uni-icons type="plusempty" size="25" color="#333"></uni-icons>
      </view>
    </view>

    <!-- 两个图表并排显示 -->
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
          :opts="gaugeOpts"
          :chartData="gaugeData"
          canvasId="gaugeChart"
          :canvas2d="true"
        />
      </view>
    </view>

    <!-- 数据栏显示 -->
    <view class="data-display">
      <!-- 当前模式 -->
      <view class="data-item" :style="modeStyle">
        <text class="data-label">当前模式</text>
        <text class="data-value">{{ isManualMode ? '手动' : '自动' }}</text>
      </view>
      <!-- 分隔线 -->
      <view class="divider"></view>
      <!-- 当前转速 -->
      <view class="data-item" :style="speedStyle">
        <text class="data-label">当前转速</text>
        <text class="data-value">{{ speedSetting }} RPM</text>
      </view>
    </view>

    <!-- 模式切换按钮 -->
    <view class="mode-toggle">
      <button @click="toggleMode" class="toggle-button">
        {{ isManualMode ? '切换到自动模式' : '切换到手动模式' }}
      </button>
    </view>

    <!-- 手动模式下的滑轮控制 -->
    <view v-if="isManualMode" class="slider-container">
      <view class="slider-label">
        <text>min：0 RPM</text>
        <text>max：100 RPM</text>
      </view>
      <slider
        :value="speedSetting"
        :min="0"
        :max="100"
        @change="handleSliderChange"
      ></slider>
      <view class="slider-value">当前设定转速：{{ speedSetting }} RPM</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 原始图表数据
const temperatureData = ref({ series: [{ name: '温度', data: 0.8 }] });
const gaugeData = ref({
  categories: [
    { value: 0.3, color: "#0000FF" }, // 蓝色：低速
    { value: 0.7, color: "#FFFF00" }, // 黄色：中速
    { value: 1.0, color: "#FF0000" }  // 红色：高速
  ],
  series: [
    { name: "转速", data: 0.66 } // 转速值归一化
  ]
});

const speedData = ref({ series: [{ name: '转速', data: 66 }] });

const temperatureOpts = ref({
  title: { name: "26°C", fontSize: 30, color: "#39b54a" },
  subtitle: { name: "实时温度", fontSize: 15, color: "#8799a3" },
  extra: { arcbar: { width: 12, startAngle: 0.75, endAngle: 0.25, customColor: ["#fbbd08", "#e54d42"] } },
});

const gaugeOpts = ref({
  title: { name: "66 RPM", fontSize: 27, color: "#8dc63f" },
  subtitle: { name: "实时转速", fontSize: 15, color: "#8799a3" },
  extra: {
    gauge: {
      type: "progress",
      width: 15,
      startAngle: 0.75, // 起始角度
      endAngle: 0.25,   // 结束角度
      startNumber: 0,   // 起始刻度值
      endNumber: 100,   // 结束刻度值
      splitLine: {
        fixRadius: 0,
        splitNumber: 10, // 大刻度数量
        width: 15,
        color: "#FFFFFF",
        childNumber: 5,  // 小刻度数量
        childWidth: 7
      },
      pointer: {
        width: 5,   // 指针宽度
        color: "auto" // 自动匹配颜色
      },
      customColor: [
        { position: 0.3, color: "#0000FF" }, // 蓝色：低速
        { position: 0.7, color: "#FFFF00" }, // 黄色：中速
        { position: 1.0, color: "#FF0000" }  // 红色：高速
      ],
      labelOffset: 10
    }
  }
});

const isManualMode = ref(false); // 当前模式：手动/自动
const speedSetting = ref(50); // 手动模式下的转速值
const connectedDeviceId = ref(null); // BLE 设备 ID

// 动态样式：当前模式
const modeStyle = computed(() => {
  return {
    color: isManualMode.value ? '#D84315' : '#00838F', // 手动时醒目，自动时蓝色
  };
});

// 动态样式：当前转速
const speedStyle = computed(() => {
  return {
    color: isManualMode.value ? '#FF5722' : '#BDBDBD', // 手动时橙红，自动时灰色
  };
});

// 在主页代码中，处理设备连接
function handleDeviceConnection() {
  if (connectedDeviceId.value) {
    uni.connectBLEDevice({
      deviceId: connectedDeviceId.value,
      success() {
        console.log("连接成功");
        // 更新连接状态等
      },
      fail() {
        console.log("连接失败");
        // 提示用户连接失败
      }
    });
  }
}


// 蓝牙通信函数
function sendDataToESP32(data) {
  if (connectedDeviceId.value) {
    const buffer = new ArrayBuffer(data.length);
    const dataView = new DataView(buffer);
    for (let i = 0; i < data.length; i++) {
      dataView.setUint8(i, data.charCodeAt(i));
    }
    uni.writeBLECharacteristicValue({
      deviceId: connectedDeviceId.value,
      serviceId: "ABC0",
      characteristicId: "ABC1",
      value: buffer,
    });
  }
}

function handleSliderChange(event) {
  speedSetting.value = event.detail.value;
  speedData.value.series[0].data = speedSetting.value;
  gaugeData.value.series[0].data = speedSetting.value / 100;
  gaugeOpts.value.title.name = `${speedSetting.value} RPM`;
  sendDataToESP32(`[mode:man,speed:${speedSetting.value}]`);
}

function toggleMode() {
  isManualMode.value = !isManualMode.value;
  const mode = isManualMode.value ? 'man' : 'auto';
  sendDataToESP32(`[mode:${mode},speed:50]`);
}

function navigateToBLE() {
  uni.navigateTo({ url: '/pages/ble/ble' });
}

// 处理 BLE 数据接收
onLoad(() => {
  uni.onBLECharacteristicValueChange((res) => {
    const receivedData = String.fromCharCode.apply(null, new Uint8Array(res.value));
    const match = receivedData.match(/mode:(.*?),tempreature:(.*?),speed:(.*?)]/);
    if (match) {
      temperatureData.value.series[0].data = parseFloat(match[2]) / 100;
      speedData.value.series[0].data = parseInt(match[3], 10);
      gaugeData.value.series[0].data = parseInt(match[3], 10) / 100;
      gaugeOpts.value.title.name = `${match[3]} RPM`;
    }
  });
});


</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f5f7fa, #c3cfe2);
  min-height: 100vh;
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.plus-icon {
  margin-right: 20rpx;
}

.data-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20rpx 0;
}

.data-item {
  text-align: center;
}

.data-label {
  font-size: 16px;
  color: #757575;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
}

.divider {
  width: 1px;
  height: 40px;
  background-color: #90caf9;
}

.chart-container {
  display: flex;
  justify-content: space-around;
}

.chart-item {
  width: 45%;
}

.mode-toggle {
  margin: 20rpx 0;
  text-align: center;
}

.toggle-button {
  background-color: #4a90e2;
  color: #fff;
  font-size: 16px;
}

.slider-container {
  margin: 20rpx;
  text-align: center;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
  font-size: 14px;
}

.slider-value {
  font-size: 16px;
  margin-top: 10rpx;
}
</style>
