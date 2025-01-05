module tb_SmartFans;

    // 输入信号
    reg sys_clk;
    reg sys_rst_n;
    reg [7:0] temp_data;
    reg rx;
    reg fg_signal;  // 方波信号输入

    // 输出信号
    wire pwm_out;
    wire tx;

    // 中间信号
    wire [12:0] unpack_data;
    wire [15:0] rpm;
    wire send_flag;
    wire bit_flag;
    wire [4:0] bit_cnt;
    wire [1:0] state;
    wire [25:0] cnt_1s;
    wire [23:0] send_data;


    // 将子模块的中间信号连接到测试平台
    assign unpack_data = uut_SmartFans.ut_uart_rx.unpack_data;
    assign rpm = uut_SmartFans.ut_speed_acq.rpm;
    assign send_flag = uut_SmartFans.ut_uart_tx.send_flag;
    assign bit_flag = uut_SmartFans.ut_uart_tx.bit_flag;
    assign bit_cnt = uut_SmartFans.ut_uart_tx.bit_cnt;
    assign state = uut_SmartFans.ut_uart_tx.state;
    assign cnt_1s = uut_SmartFans.ut_uart_tx.cnt_1s;
    assign send_data = uut_SmartFans.ut_uart_tx.send_data;

    // 实例化顶层模块
    SmartFans uut_SmartFans (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .temp_data(temp_data),
        .rx(rx),
        .fg_signal(fg_signal),
        .pwm_out(pwm_out),
        .tx(tx)
    );

    // 时钟生成（50MHz系统时钟）
    initial begin
        sys_clk = 0;
        forever #10 sys_clk = ~sys_clk;  // 20ns周期 = 50MHz
    end

    // 测试流程
    initial begin
        // 初始化信号
        sys_rst_n = 0;
        temp_data = 8'd0;
        rx = 1;
        fg_signal = 0;

        // 复位系统
        #100;
        sys_rst_n = 1;

        // 发送第一组数据：手动模式，速度 = 1000 (0x03E8)
        send_uart_data(16'h13E8);
        #1000;  // 等待一段时间

        // 发送第二组数据：自动模式，温度 = 60
        temp_data = 8'd60;
        send_uart_data(16'h0000);
        #1000;  // 等待一段时间

        // 发送第三组数据：手动模式，速度 = 3800 (0x0BB8)
        send_uart_data(16'h1ED8);
        #1000;  // 等待一段时间

        // 发送第四组数据：自动模式，温度 = 100
        temp_data = 8'd100;
        send_uart_data(16'h0000);
        #1000;  // 等待一段时间

        // 结束仿真
        $stop;
    end

    // UART发送任务
    task send_uart_data;
        input [15:0] data;
        integer i;
        begin
            // 发送第一个字节（低8位）
            for (i = 0; i < 10; i = i + 1) begin
                case (i)
                    0: rx <= 1'b0;  // 起始位
                    1: rx <= data[0];
                    2: rx <= data[1];
                    3: rx <= data[2];
                    4: rx <= data[3];
                    5: rx <= data[4];
                    6: rx <= data[5];
                    7: rx <= data[6];
                    8: rx <= data[7];
                    9: rx <= 1'b1;  // 停止位
                endcase
                #8681;  // 1个波特率周期 = 1/115200 ≈ 8.68us
            end

            // 发送第二个字节（高8位）
            for (i = 0; i < 10; i = i + 1) begin
                case (i)
                    0: rx <= 1'b0;  // 起始位
                    1: rx <= data[8];
                    2: rx <= data[9];
                    3: rx <= data[10];
                    4: rx <= data[11];
                    5: rx <= data[12];
                    6: rx <= data[13];
                    7: rx <= data[14];
                    8: rx <= data[15];
                    9: rx <= 1'b1;  // 停止位
                endcase
                #8681;  // 1个波特率周期 = 1/115200 ≈ 8.68us
            end
        end
    endtask

    // 生成32Hz方波信号的任务
    task generate_32hz_signal;
        begin
            forever begin
                fg_signal = 1;  // 高电平
                #15625000;      // 32Hz周期的一半 = 15.625ms
                fg_signal = 0;  // 低电平
                #15625000;      // 32Hz周期的一半 = 15.625ms
            end
        end
    endtask

    // 生成100Hz方波信号的任务
    task generate_100hz_signal;
        begin
            forever begin
                fg_signal = 1;  // 高电平
                #5000000;       // 100Hz周期的一半 = 5ms
                fg_signal = 0;  // 低电平
                #5000000;       // 100Hz周期的一半 = 5ms
            end
        end
    endtask

    // 启动方波信号生成任务
    initial begin
        #200;  // 等待系统初始化完成
        fork
            generate_32hz_signal;  // 启动32Hz方波信号
            // generate_100hz_signal;  // 启动100Hz方波信号
        join
    end

endmodule