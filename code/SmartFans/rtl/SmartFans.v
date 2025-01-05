module SmartFans (
    input wire sys_clk,             // 系统时钟 50MHz
    input wire sys_rst_n,           // 系统复位信号，低电平有效
    input wire rx,  
    input wire fg_signal,
    
    inout wire dq,

    output wire pwm_out,             // PWM 输出信号
    output wire tx
);

    wire [6:0] duty_data_1;  
    wire [12:0] unpack_data_1;  
    wire [15:0] rpm_1;  
    wire [7:0] temp_data_1;  

    

    // 实例化 logic_ctrl 模块
    logic_ctrl ut_logic_ctrl (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .unpack_data(unpack_data_1),
        .temp_data(temp_data_1),
        .duty_data(duty_data_1)
    );

    // 实例化 pwm_ctrl 模块
    pwm_ctrl ut_pwm_ctrl (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .duty_data(duty_data_1),
        .pwm_out(pwm_out)
    );

    // 实例化 pwm_ctrl 模块
    uart_rx ut_uart_rx (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .rx(rx),

        .unpack_data(unpack_data_1)
    );

    // 实例化 uart_tx 模块
    uart_tx ut_uart_tx (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .temp_data(temp_data_1),     // 温度数据输入
        .rpm(rpm_1),          // 转速数据输入
 
        .tx(tx)            
    );

    // 实例化 speed_acq 模块
    speed_acq ut_speed_acq (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        .fg_signal(fg_signal),     // 温度数据输入
        
        .rpm(rpm_1)          // 转速数据输入         
    );

    // 实例化 ds18b20_ctrl 模块
    ds18b20_ctrl ut_ds18b20_ctrl (
        .sys_clk(sys_clk),
        .sys_rst_n(sys_rst_n),
        
        .dq(dq)          ,   //数据总线
        .temp_data(temp_data_1)      //输出温度(7位数据，补为8位输出)   
    );

endmodule