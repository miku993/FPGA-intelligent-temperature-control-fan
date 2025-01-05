module logic_ctrl(
    input sys_clk,
    input sys_rst_n,
    input [12:0] unpack_data,  // 低12位为速度speed，最高位为模式值
    input [7:0] temp_data,     // 温度数据

    output reg [6:0] duty_data // 输出占空比数据
);
    wire [11:0] speed;  // 速度，取unpack_data的低12位
    wire mode;           // 模式，取unpack_data的最高位
    assign speed = unpack_data[11:0];
    assign mode = unpack_data[12];

    parameter   Per_Duty_500_1000  =   25  ;     // 500-1000:每一个%增加25RPM
    parameter   Per_Duty_1000_1950  =   32  ;     // 1000-1950:每一个%增加32RPM
    parameter   Per_Duty_1950_3800  =   37  ;     // 1950-3800:每一个%增加37RPM

    always @(posedge sys_clk or negedge sys_rst_n) begin
        if (~sys_rst_n) begin
            duty_data <= 7'b0;
        end else begin
            if (mode == 1'b1) begin
                // 手动模式
                duty_data <= speed_to_duty(speed);
            end else begin
                // 自动模式，根据温度调节转速
                duty_data <= temp_to_duty(temp_data);
            end
        end
    end

    // 速度到占空比的映射
    function [6:0] speed_to_duty;
        input [11:0] speed;
        begin
            if ((speed >= 500) && (speed < 1000))
                speed_to_duty = 0 + ((speed - 500) / Per_Duty_500_1000);
            else if ((speed >= 1000) && (speed < 1950))
                speed_to_duty = 30 + ((speed - 1000) / Per_Duty_1000_1950);
            else if ((speed >= 1950) && (speed <= 3800))
                speed_to_duty = 50 + ((speed - 1950) / Per_Duty_1950_3800);
            else
                speed_to_duty = 0;  // 对应其他值，可以根据需要调整
        end
    endfunction

    // 温度到占空比的映射，温度范围0-125，转速范围500-3800
    function [6:0] temp_to_duty;
        input [7:0] temp;
        begin
            if (temp <= 30)
                temp_to_duty = 0;
            else if (temp <= 40)
                temp_to_duty = 20;
            else if (temp <= 50)
                temp_to_duty = 40;
            else if (temp <= 60)
                temp_to_duty = 60;
            else if (temp <= 70)
                temp_to_duty = 80;
            else
                temp_to_duty = 100;  // 温度高于100时最大转速
        end
    endfunction
endmodule
