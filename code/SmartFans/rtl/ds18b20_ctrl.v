module  ds18b20_ctrl
(
    input   wire        sys_clk     ,   //系统时钟，频率50MHz
    input   wire        sys_rst_n   ,   //复位信号，低电平有效

    inout   wire        dq          ,   //数据总线

    output  wire [7:0] temp_data      //输出温度(7位数据，补为8位输出)

);

parameter   S_INIT          =   3'd1, //初始状态
            S_WR_CMD        =   3'd2, //给跳过ROM及温度转换指令
            S_WAIT          =   3'd3, //等待温度转换完成
            S_INIT_AGAIN    =   3'd4, //再次回到初始化
            S_RD_CMD        =   3'd5, //给跳过ROM及读温度转换指令
            S_RD_TEMP       =   3'd6; //读温度状态

parameter   WR_44CC_CMD =   16'h44cc; //跳过ROM及温度转换命令，低位在前
parameter   WR_BECC_CMD =   16'hbecc; //跳过ROM及读取温度命令，低位在前

parameter   S_WAIT_MAX  =   750000  ; //750ms

//reg   define
reg         clk_1us     ;   //分频时钟，单位时钟1us
reg [4:0]   cnt         ;   //分频计数器
reg [2:0]   state       ;   //状态机状态
reg [19:0]  cnt_1us     ;   //微秒计数器
reg [3:0]   bit_cnt     ;   //字节计数器
reg [15:0]  data_tmp    ;   //读取ds18b20的温度
reg [19:0]  data        ;   //判断完正负后的温度
reg         flag_pulse  ;   //初始化存在脉冲标志信号
reg         dq_out      ;   //输出总线数据，即FPGA给的总线数据值
reg         dq_en       ;   //输出总线数据使能信号

//温度转换,保留整数
assign temp_data = (data * 10'd625)/ 14'd10000;

//FPGA总线控制: 当使能信号为1是总线的值为dq_out的值，为0时为高阻态
assign  dq  =   (dq_en ==1 ) ? dq_out : 1'bz;

//cnt:分频计数器
always@(posedge sys_clk or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        cnt <=  5'b0;
    else    if(cnt == 5'd24)
        cnt <=  5'b0;
    else
        cnt <=  cnt + 1'b1;

//clk_1us：产生单位时钟为1us的时钟
always@(posedge sys_clk or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        clk_1us <=  1'b0;
    else    if(cnt == 5'd24)
        clk_1us <=  ~clk_1us;
    else
        clk_1us <=  clk_1us;

//cnt_1us：1us时钟计数器，用于状态跳转
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        cnt_1us <=  20'b0;
    else    if(((state==S_WR_CMD || state==S_RD_CMD || state==S_RD_TEMP)
       && cnt_1us==20'd64) || ((state==S_INIT || state==S_INIT_AGAIN) &&
       cnt_1us==20'd999) || (state==S_WAIT && cnt_1us==S_WAIT_MAX))
        cnt_1us <=  20'b0;      // 不同状态对应不同的时间终值：
                                // S_INIT、S_INIT_AGAIN -> 1ns
                                // S_WR_CMD、S_RD_CMD、S_RD_TEMP -> 64us
    else
        cnt_1us <=  cnt_1us +   1'b1;

//bit_cnt：bit计数器，写1bit或读1bit加1，一次写完之后清零
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        bit_cnt  <=  4'b0;
    else    if((state == S_RD_TEMP || state == S_WR_CMD ||
         state == S_RD_CMD) && (cnt_1us == 20'd64 && bit_cnt == 4'd15))
        bit_cnt  <=  4'b0;
    else    if((state == S_WR_CMD || state == S_RD_CMD ||
                              state == S_RD_TEMP) && cnt_1us == 20'd64)
        bit_cnt  <=  bit_cnt + 1'b1;

//flag_pulse: 初始化存在脉冲标志信号,初始化状态时，当总线发来存在脉冲才能初始化成功
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        flag_pulse  <=  1'b0;
    else    if(cnt_1us == 20'd570 && dq == 1'b0 && (state == S_INIT ||
                                                state == S_INIT_AGAIN))
        flag_pulse  <=  1'b1;       // 从机应答
    else    if(cnt_1us == 999)
        flag_pulse  <=  1'b0;       // 从机未应答
    else
        flag_pulse  <=  flag_pulse;

//state: 状态跳转
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        state   <=  S_INIT;
    else
        case(state)
    //初始化最小时间为960us
       S_INIT:  //收到存在脉冲且时间需大于960us跳转
            if(cnt_1us == 20'd999  && flag_pulse == 1'b1 )
                state   <=  S_WR_CMD;
            else
                state   <=  S_INIT;
        S_WR_CMD:   //发送完跳过ROM和温度转换命令后跳转
            if(bit_cnt == 4'd15 && cnt_1us == 20'd64 )
                state   <=  S_WAIT;
            else
                state   <=  S_WR_CMD;
        S_WAIT: //等待750ms后跳转
            if(cnt_1us == S_WAIT_MAX)
                state   <=  S_INIT_AGAIN;
            else
                state   <=  S_WAIT;
        S_INIT_AGAIN:   //再次初始化后跳转
            if(cnt_1us == 20'd999  && flag_pulse == 1'b1 )
                state   <=  S_RD_CMD;
            else
                state   <=  S_INIT_AGAIN;
        S_RD_CMD:   //发送完跳过ROM和读取温度命令后跳转
            if(bit_cnt == 4'd15 && cnt_1us == 20'd64)
                state   <=  S_RD_TEMP;
            else
                state   <=  S_RD_CMD;
        S_RD_TEMP:  //读完2字节的温度后跳转
            if(bit_cnt == 4'd15 && cnt_1us == 20'd64)
                state   <=  S_INIT;
            else
                state   <=  S_RD_TEMP;
        default:
                state   <=  S_INIT;
        endcase

//dq_out、dq_en: 给各状态下的总线相应的时序
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        begin
            dq_out  <=  1'b0;
            dq_en   <=  1'b0;
        end
    else
        case(state)
    //初始化是最小480us低电平，然后释放总线
        S_INIT:
            if(cnt_1us < 20'd499)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
    //每一个写时段最少有60us的持续时间和最少1us的恢复时间
    //写0：总线拉低后一直拉低，最少60us
    //写1：总线拉低后必须在15us内释放总线
        S_WR_CMD:
            if(cnt_1us > 20'd62)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
            else    if(cnt_1us <= 20'b1)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else    if(WR_44CC_CMD[bit_cnt] == 1'b0)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else    if(WR_44CC_CMD[bit_cnt] == 1'b1)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
    //为适应寄生电源，温度转换命令后将总线拉高
        S_WAIT:
            begin
                dq_out  <=  1'b1;
                dq_en   <=  1'b1;
            end
    //与第一次初始化时序一致
        S_INIT_AGAIN:
            if(cnt_1us < 20'd499)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
    //与发送跳过ROM和读取温度命的时序一致
        S_RD_CMD:
            if(cnt_1us > 20'd62)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
            else    if(cnt_1us <= 20'b1)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else    if(WR_BECC_CMD[bit_cnt] == 1'b0)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else    if(WR_BECC_CMD[bit_cnt] == 1'b1)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
    //拉低总线超过1us后释放总线
        S_RD_TEMP:
            if(cnt_1us <=1)
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b1;
                end
            else
                begin
                    dq_out  <=  1'b0;
                    dq_en   <=  1'b0;
                end
        default:;
        endcase

//data_tmp:读出温度，寄存在data_tmp里
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        data_tmp    <=  16'b0;
        //总线拉低后数据有效时间为15us
    else    if(state == S_RD_TEMP && cnt_1us == 20'd13)
        data_tmp   <=  {dq,data_tmp[15:1]};     // 12位精度，有效数据位[15:0]
    else
        data_tmp    <=  data_tmp;

//温度判断，输出温度
always@(posedge clk_1us or  negedge sys_rst_n)
    if(sys_rst_n == 1'b0)
        data    <=  20'b0;
    else    if(data_tmp[15] == 1'b0 && state == S_RD_TEMP &&
                            cnt_1us == 20'd60 && bit_cnt == 4'd15)
        data    <=  data_tmp[10:0];     // 数据位为[10:0]

endmodule 
