module  uart_tx
#(
    parameter   UART_BPS    =   'd115200,         //串口波特率
    parameter   CLK_FREQ    =   'd50_000_000    //时钟频率
)
(
     input   wire            sys_clk     ,   //系统时钟50MHz
     input   wire            sys_rst_n   ,   //全局复位
     input   wire [7:0]      temp_data,     // 温度数据输入
     input   wire [15:0]     rpm,          // 转速数据输入
 
     output  reg             tx              //串转并后的1bit数据
);

localparam  BAUD_CNT_MAX    =   CLK_FREQ/UART_BPS   ;

reg [12:0]  baud_cnt;       //波特率计数器
reg         bit_flag;       //比特标志位
reg [4:0]   bit_cnt ;       //比特计数器
reg         send_flag;      //发送开始标志位
wire [23:0]       send_data;      //打包好的数据,(temp_data 8位 + rpm 16位 = 3Byte = 24bit )
reg [25:0]  cnt_1s;             // 1秒计数器
reg [1:0]   state;             // 状态机变量

// 状态机状态
localparam START     = 2'b00,
           SEND_BYTE = 2'b01,
           WAIT_1s   = 2'b10;

assign send_data = {rpm[15:8],rpm[7:0],temp_data[7:0]};

//send_flag:发送开始信号
always@(posedge sys_clk or negedge sys_rst_n)
        if(sys_rst_n == 1'b0)
            send_flag <= 1'b0;
        else    if(state == START)      // 状态机指示开始
            send_flag <= 1'b1;
        else 
            send_flag <= 1'b0;

//baud_cnt:波特率计数器计数，从0计数到BAUD_CNT_MAX - 1
always@(posedge sys_clk or negedge sys_rst_n)
        if(sys_rst_n == 1'b0)
            baud_cnt <= 13'b0;
        else    if((baud_cnt == BAUD_CNT_MAX - 1) || (state == WAIT_1s))   
            baud_cnt <= 13'b0;
        else    if(state == SEND_BYTE)
            baud_cnt <= baud_cnt + 1'b1;

//bit_flag:当baud_cnt计数器计数到1时让bit_flag拉高一个时钟的高电平
always@(posedge sys_clk or negedge sys_rst_n)
        if(sys_rst_n == 1'b0)
            bit_flag <= 1'b0;
        else    if(baud_cnt == 13'd1)
            bit_flag <= 1'b1;
        else
            bit_flag <= 1'b0;

//bit_cnt:数据位数个数计数，30个有效数据（含起始位和停止位）到来后计数器清零
always@(posedge sys_clk or negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        bit_cnt <= 5'b0;
    else    if((bit_flag == 1'b1) && (bit_cnt == 5'd29))        //三个字节发送结束
        bit_cnt <= 5'b0;
    else    if((bit_flag == 1'b1) && (state == SEND_BYTE))
        bit_cnt <= bit_cnt + 1'b1;

//cnt_1s:字节计数器
always@(posedge sys_clk or negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        cnt_1s <= 26'b0;
    else    if(state == WAIT_1s)      // 状态机变换
        cnt_1s <= cnt_1s + 1'b1;
    else
        cnt_1s <= 26'b0;

// 状态机逻辑
always @(posedge sys_clk or negedge sys_rst_n) begin
    if (!sys_rst_n) begin
        state <= START;
    end else begin
        case (state)
            START: begin
                if(send_flag == 1'b1)       // 开始发送信号拉起
                    state <= SEND_BYTE;
            end

            SEND_BYTE: begin
                if((bit_flag == 1'b1) && (bit_cnt == 5'd29))
                    state <= WAIT_1s;
                else
                    state <= SEND_BYTE;
            end

            WAIT_1s: begin
                if(cnt_1s == 26'd49_999_999)        //计数到1s，返回初始态
                    state <= START;
            end
            default: state <= START;
        endcase
    end
end

//tx:输出数据在满足rs232协议（起始位为0，停止位为1）的情况下一位一位输出
always@(posedge sys_clk or negedge sys_rst_n)
        if(sys_rst_n == 1'b0)
            tx <= 1'b1;     //空闲状态时为高电平

        // 第一个字节 
        else    if(bit_flag == 1'b1)      
            case(bit_cnt)
                0       : tx <= 1'b0;
                1       : tx <= send_data[0];
                2       : tx <= send_data[1];
                3       : tx <= send_data[2];
                4       : tx <= send_data[3];
                5       : tx <= send_data[4];
                6       : tx <= send_data[5];
                7       : tx <= send_data[6];
                8       : tx <= send_data[7];
                9      : tx <= 1'b1;

                10       : tx <= 1'b0;
                11       : tx <= send_data[8];
                12       : tx <= send_data[9];
                13       : tx <= send_data[10];
                14       : tx <= send_data[11];
                15       : tx <= send_data[12];
                16       : tx <= send_data[13];
                17       : tx <= send_data[14];
                18       : tx <= send_data[15];
                19       : tx <= 1'b1;

                20       : tx <= 1'b0;
                21       : tx <= send_data[16];
                22       : tx <= send_data[17];
                23       : tx <= send_data[18];
                24       : tx <= send_data[19];
                25       : tx <= send_data[20];
                26       : tx <= send_data[21];
                27       : tx <= send_data[22];
                28       : tx <= send_data[23];
                29       : tx <= 1'b1;

                default : tx <= 1'b1;
            endcase
endmodule
