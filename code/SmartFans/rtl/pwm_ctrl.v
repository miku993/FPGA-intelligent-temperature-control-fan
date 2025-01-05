module pwm_ctrl(
    input sys_clk,           // 系统时钟
    input sys_rst_n,         // 复位信号，低有效
    input [6:0] duty_data,   // 输入占空比数据（范围0-100）
    
    output reg pwm_out       // 输出PWM信号
);
    wire [10:0] duty_count;    // 占空比对应的计数值，最大值为2000
    reg [10:0] pwm_counter;   // 用于生成25kHz的计数器，最大值为2000

assign duty_count = (duty_data * 2000) / 100;  // duty_data 变成占空比对应的计数值（最大2000）

// pwm_counter
always @(posedge sys_clk or negedge sys_rst_n) 
        if (~sys_rst_n) begin
            pwm_counter <= 11'b0;  // 复位时，将PWM计数器清零
        end
        else   if (pwm_counter < 11'd1999) begin
            pwm_counter <= pwm_counter + 1;
        end 
        else begin
            pwm_counter <= 11'b0;  // 计数器溢出，重新开始
        end

// pwm_out
always @(posedge sys_clk or negedge sys_rst_n) 
        if (~sys_rst_n) begin
            pwm_out <= 1'b0;    // 复位时，PWM输出为低电平
        end
        else if (pwm_counter < duty_count)begin
            pwm_out <= 1'b1;  // 如果计数器小于 duty_count，输出高电平
        end 
        else 
            pwm_out <= 1'b0;  // 否则输出低电平
endmodule
