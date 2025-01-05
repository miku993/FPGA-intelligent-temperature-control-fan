#include <ArduinoJson.h>
#include <NimBLEDevice.h>

// BLE服务和特征对象
NimBLEServer *pServer = nullptr;
NimBLEService *pService = nullptr;
NimBLECharacteristic *pCharacteristicRX = nullptr;
NimBLECharacteristic *pCharacteristicTX = nullptr;
NimBLEAdvertising *pAdvertising = nullptr;

// 数据缓存
uint16_t lastSerialData = 0xFFFF; // 上一次发送到串口的数据

// 串口通信相关
const uint32_t SERIAL_BAUD_RATE = 115200; // 串口波特率

// 初始化BLE
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

// 从串口读取数据并解析
void processSerialData()
{
  if (Serial.available() >= 3) // 确保接收到3字节数据
  {
    uint8_t buffer[3];
    Serial.readBytes(buffer, 3);

    // 提取温度和速度数据
    uint8_t temperature = buffer[0];               // 第1字节为温度
    uint16_t speed = (buffer[2] << 8) | buffer[1]; // 第2字节和第3字节组成速度

    // 打包为JSON格式并发送到BLE
    char jsonData[32];
    snprintf(jsonData, sizeof(jsonData), "{\"temperature\":%d,\"speed\":%d}", temperature, speed);
    String jsonDataToSend = String(jsonData);
    pCharacteristicTX->setValue(jsonDataToSend);
    pCharacteristicTX->notify();

    Serial.printf("Parsed Data -> Temperature: %d, Speed: %d\n", temperature, speed);
  }
}

// 将蓝牙接收到的JSON数据解包并发送到串口
void processBLEData()
{
  std::string receivedData = pCharacteristicRX->getValue();
  if (!receivedData.empty())
  {
    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, receivedData);

    const char *mode = doc["mode"] | "auto";
    uint16_t speed = doc["speed"] | 0;

    uint16_t packedData = 0;
    if (strcmp(mode, "man") == 0)
    {
      packedData |= (1 << 12); // 第13位置为1
    }
    packedData |= (speed & 0x7FFF); // 设置速度数据

    // 如果数据有变化才发送
    if (packedData != lastSerialData)
    {
      Serial.write((uint8_t *)&packedData, 2);
      // Serial.printf("发送至fpga: 0x%04X\n", packedData);
      lastSerialData = packedData;
    }

    pCharacteristicRX->setValue(""); // 清空特征值
  }
}

void setup()
{
  Serial.begin(SERIAL_BAUD_RATE);
  initBLE();
}

void loop()
{
  processSerialData();
  processBLEData();
  delay(20);
}
