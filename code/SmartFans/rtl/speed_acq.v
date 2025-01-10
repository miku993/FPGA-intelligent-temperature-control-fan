module speed_acq (
    input wire sys_clk,         // 系统时钟
    input wire sys_rst_n,       // 系统复位信号，低电平有效
    input wire fg_signal,       // 频率生成器信号 (V_FG)
    
    output reg [15:0] rpm      // 转速输出 (RPM)(12位数据，补为16位输出)
);

// 中间信号定义
reg [25:0] counter;            // 时钟计数器，用于测量周期
reg [25:0] ts_count;           // 保存一个周期的时钟计数值
reg fg_signal_d;               // fg_signal 延迟，用于边沿检测
reg fg_signal_d1;                // 一级缓冲，消亚稳态
reg fg_signal_d2;                // 二级缓冲，消亚稳态
wire fg_rising_edge;            // 上升沿检测信号

// 参数定义
parameter CLK_FREQ = 50000000; // 系统时钟频率 (50 MHz)
assign fg_rising_edge = fg_signal_d1 & ~fg_signal_d2; // 检测上升沿

// 信号边沿检测
always @(posedge sys_clk or negedge sys_rst_n) begin
    if (!sys_rst_n) begin
        fg_signal_d <= 1'b0;
        fg_signal_d1 <= 1'b0;
        fg_signal_d2 <= 1'b0;
    end 
    else begin
        fg_signal_d1 <= fg_signal;
        fg_signal_d2 <= fg_signal_d1;
    end
end


// 周期测量和计数器
always @(posedge sys_clk or negedge sys_rst_n) begin
    if (!sys_rst_n) begin
        counter <= 26'd0;
        ts_count <= 26'd0;
    end 
    else begin
        if (fg_rising_edge) begin
            ts_count <= counter;        // 保存完整周期计数值
            counter <= 26'd0;           // 清零计数器
        end 
        else begin
            if (counter < CLK_FREQ) begin
                counter <= counter + 1; // 累计周期计数
            end 
        end
    end
end

// 转速计算 (RPM)
always @(posedge sys_clk or negedge sys_rst_n) begin
    if (!sys_rst_n) begin
        rpm <= 16'd0;
    end 
    else if (ts_count != 32'd0) begin
        //rpm <= (60 * CLK_FREQ) / (2 * ts_count); // 计算 RPM (4 极)
        rpm <= 16'd2000;        //测试
    end
end

endmodule
