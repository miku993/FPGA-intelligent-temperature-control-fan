<template>
  <view class="container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">转速与温度监控</text>
    </view>

    <!-- 仪表盘图表 -->
    <view class="chart-box">
      <qiun-data-charts
        type="gauge"
        :opts="gaugeOpts"
        :chartData="gaugeData"
        canvasId="gaugeChart"
        :canvas2d="true"
      />
    </view>
    
    <!-- 滑块控制器 -->
    <view class="slider-container">
      <text>当前转速: {{ currentSpeed }} RPM</text>
      <slider
        :value="currentSpeed"
        :min="0"
        :max="100"
        @change="updateSpeed"
        show-value
      />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 当前转速值
const currentSpeed = ref(50); // 初始转速为50

// 仪表盘数据
const gaugeData = ref({
  categories: [
    { value: 0.3, color: "#0000FF" }, // 蓝色：低速
    { value: 0.7, color: "#FFFF00" }, // 黄色：中速
    { value: 1.0, color: "#FF0000" }  // 红色：高速
  ],
  series: [
    { name: "转速", data: currentSpeed.value / 100 } // 转速值归一化
  ]
});

// 仪表盘配置
const gaugeOpts = ref({
  title: { name: `${currentSpeed.value} RPM`, fontSize: 25, color: "#8dc63f" },
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

// 更新转速值和图表
function updateSpeed(event) {
  currentSpeed.value = event.detail.value; // 获取滑块的值
  gaugeData.value.series[0].data = currentSpeed.value / 100; // 数据归一化
  gaugeOpts.value.title.name = `${currentSpeed.value} RPM`; // 动态更新标题
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
  height: 100vh;
}

.header {
  margin: 20px 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.chart-box {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider-container {
  margin-top: 20px;
  width: 90%;
  text-align: center;
}

text {
  font-size: 16px;
  color: #333;
}
</style>
