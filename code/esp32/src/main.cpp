#include <Arduino.h>
#include <NimBLEDevice.h>

// BLE服务和特征对象
NimBLEServer *pServer = nullptr;
NimBLEService *pService = nullptr;
NimBLECharacteristic *pCharacteristicRX = nullptr;
NimBLECharacteristic *pCharacteristicTX = nullptr;
NimBLEAdvertising *pAdvertising = nullptr;

// 数据缓存
String lastSpeedValue = ""; // 上一次的speed值
String lastSentData = "";   // 上一次发送的数据
// 串口通信相关
const uint32_t SERIAL_BAUD_RATE = 115200; // 串口波特率

void initBLE()
{
  NimBLEDevice::init("SmartFan"); // 设置设备名称为英文

  // 创建BLE服务器
  pServer = NimBLEDevice::createServer();

  // 创建服务，使用128位UUID
  pService = pServer->createService("0000ABC0-0000-1000-8000-00805F9B34FB");

  // 创建特征值
  pCharacteristicRX = pService->createCharacteristic(
      "0000ABC1-0000-1000-8000-00805F9B34FB",
      NIMBLE_PROPERTY::WRITE);

  pCharacteristicTX = pService->createCharacteristic(
      "0000ABC2-0000-1000-8000-00805F9B34FB",
      NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);

  // 启动服务
  if (pService->start())
  {
    Serial.println("Service started successfully.");
  }
  else
  {
    Serial.println("Failed to start service.");
  }

  // 设置广播
  pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID("0000ABC0-0000-1000-8000-00805F9B34FB");

  // 开始广播
  if (pAdvertising->start())
  {
    Serial.println("BLE initialized successfully, advertising started...");
  }
  else
  {
    Serial.println("Failed to start advertising.");
  }
}

// 从串口读取数据，并封装为标准字符串格式
String readDataFromSerial()
{
  if (Serial.available() > 0)
  {
    String rawData = Serial.readStringUntil('\n');
    Serial.printf("从串口接收数据: %s\n", rawData.c_str());
    return rawData;
  }
  return "";
}

// 将数据发送到BLE客户端
void sendDataToBLE(const String &data)
{
  String dataToSend = data; // 创建数据的副本以避免修改原始数据
  if (dataToSend.endsWith("\n"))
  {
    dataToSend.remove(dataToSend.length() - 2); // 如果字符串以\n结尾，移除它
  }
  pCharacteristicTX->setValue(dataToSend.c_str());
  pCharacteristicTX->notify();
  Serial.printf("通过BLE发送数据: %s\n", dataToSend.c_str());
  pCharacteristicTX->setValue(""); // 清空BLE特征值
}

// 解析数据中的speed值
String parseSpeed(const String &data)
{
  int speedIndex = data.indexOf("speed:");
  if (speedIndex != -1)
  {
    int colonIndex = data.indexOf(":", speedIndex);
    if (colonIndex != -1)
    {
      int commaIndex = data.indexOf(",", colonIndex);
      if (commaIndex == -1)
      {
        commaIndex = data.length();
      }
      return data.substring(colonIndex + 1, commaIndex);
    }
  }
  return "";
}

// 处理从BLE接收到的数据，并发送到串口
void handleBLEData()
{
  String receivedData = pCharacteristicRX->getValue();
  if (!receivedData.isEmpty())
  {
    String currentSpeed = parseSpeed(receivedData);
    if (currentSpeed != lastSpeedValue)
    {
      Serial.println(receivedData);
      lastSpeedValue = currentSpeed;
    }
    pCharacteristicRX->setValue(""); // 清空BLE特征值
  }
}

// 主程序初始化
void setup()
{
  Serial.begin(SERIAL_BAUD_RATE);
  initBLE();
}

// 主循环
void loop()
{
  String serialData = readDataFromSerial();
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime >= 1000)
  {
    sendDataToBLE(serialData);
    lastSendTime = millis(); // 更新发送时间
  }
  handleBLEData();
  delay(20);
}