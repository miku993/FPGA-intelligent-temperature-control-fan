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
          :opts="speedOpts"
          :chartData="speedData"
          canvasId="speedChart"
          :canvas2d="true"
        />
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
      <!-- 滑轮插件占位 -->
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
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 温度图表配置
const temperatureData = ref({});
const temperatureOpts = ref({
  title: { name: "26°C", fontSize: 30, color: "#39b54a" },
  subtitle: { name: "实时温度", fontSize: 15, color: "#8799a3" },
  extra: { arcbar: { width: 12, startAngle: 0.75, endAngle: 0.25, customColor: ["#fbbd08", "#e54d42"] } },
});

// 转速图表配置
const speedData = ref({});
const speedOpts = ref({
  title: { name: "66 RPM", fontSize: 27, color: "#8dc63f" },
  subtitle: { name: "实时转速", fontSize: 15, color: "#8799a3" },
  extra: { gauge: { type: "default", width: 15, startNumber: 0, endNumber: 100 } },
});

// 模式状态和滑轮值
const isManualMode = ref(false);
const speedSetting = ref(50);

function handleSliderChange(event) {
  speedSetting.value = event.detail.value; // 通过 event.detail.value 获取滑轮值
  speedData.value = { series: [{ name: "转速", data: speedSetting.value }] };
}

// 切换手动/自动模式
function toggleMode() {
  isManualMode.value = !isManualMode.value;
}

// 更新转速图表
function updateSpeedChart() {
  
}

// 导航到 BLE 查找页面
function navigateToBLE() {
  uni.navigateTo({ url: "/pages/ble/ble" });
}

onMounted(() => {
  temperatureData.value = { series: [{ name: "温度", data: 0.8 }] };
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
</style>
