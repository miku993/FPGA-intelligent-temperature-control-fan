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
          :opts="gaugeOpts"
          :chartData="gaugeData"
          canvasId="gaugeChart"
          :canvas2d="true"
        />
      </view>
    </view>

    <view class="data-display">
      <view class="data-item" :style="modeStyle">
        <text class="data-label">当前模式</text>
        <text class="data-value">{{ isManualMode ? '手动' : '自动' }}</text>
      </view>
      <view class="divider"></view>
      <view class="data-item" :style="speedStyle">
        <text class="data-label">当前转速</text>
        <text class="data-value">{{ speedSetting }} RPM</text>
      </view>
    </view>

    <view class="mode-toggle">
      <button @click="toggleMode" class="toggle-button">
        {{ isManualMode ? '切换到自动模式' : '切换到手动模式' }}
      </button>
    </view>

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

const speedSetting = ref(50); // 当前设定转速
const isManualMode = ref(true); // 是否手动模式
const deviceId = ref(''); // 设备 ID
const serviceId = ref('0000ABC0-0000-1000-8000-00805F9B34FB');
const characteristicId_RX = ref('0000ABC1-0000-1000-8000-00805F9B34FB'); // 接收通道
const characteristicId_TX = ref('0000ABC2-0000-1000-8000-00805F9B34FB'); // 发送通道
const message = ref(''); // 显示接收到的消息
const messageHex = ref(''); // 显示接收到的十六进制数据


/**************************
	uchart动态数据表
**************************/
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


/**************************
	界面逻辑
**************************/
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

// 滑动条改变时触发
function handleSliderChange(event) {
  speedSetting.value = event.detail.value;
  speedData.value.series[0].data = speedSetting.value;
  gaugeData.value.series[0].data = speedSetting.value / 100;
  gaugeOpts.value.title.name = `${speedSetting.value} RPM`;
  sendDataToESP32(`[mode:man,speed:${speedSetting.value}]`);
}

// 切换模式
function toggleMode() {
  isManualMode.value = !isManualMode.value;
  const mode = isManualMode.value ? 'man' : 'auto';
  sendDataToESP32(`[mode:${mode},speed:50]`);
}

// 界面跳转，接收device值
const onLoad = (options) => {
    deviceId.value = options.deviceId;
	console.log(deviceId.value)
};





/**************************
	BLE数据收发
**************************/

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
