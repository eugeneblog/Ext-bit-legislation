//视图控制器
//用户控制器
Ext.define('app.view.user.Controller', {
    extend: 'ux.app.ViewController',
    alias: 'controller.user',
    //登录页面启动时
    onLoginRender: function () {
        var me = this;
        app.model.User.load(1, {
            success: function (user) {
                //如果读取到本地用户信息，自动填充到表单
                me.getViewModel().setData(user.getData());
            }
        });
        var view = me.getView(),
        box = view.getBox(),
        el = view.getEl();
        console.log(box)
        console.log(el)
        // me.loadAnimation(el);
    },

    loadAnimation: function(el){
       var me = this;
       this.setAnimation(el)
        
    },
    onSpecialkey: function (f, e) {
        var me = this;
        if (e.getKey() == e.ENTER) {
            //按回车时自动提交数据
            me.onLoginClick();
        }
    },
    //点击登录
    onLoginClick: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form'),
            values = form.getValues();
        //请求登录接口
        util.ajaxB(config.user.login, values, 'POST').then(function (response) {
            if (response.success) {
                me.keepUser(values);
                //登录成功
                me.loginSuccess(response.data);
            } else {
                //登录失败
                form.getForm().setValues({
                    password: ''
                });
            }
            //提示消息
            Ext.toast(response.message);
        });
    },
    //登录成功
    loginSuccess: function (data) {
        //全局变量写入用户信息
        config.userData = data;
        console.log(config.userData);
        //关闭弹窗
        this.getView().close();
        //触发路由
        //由核心控制器接收路由，处理登录成功流程
        this.redirectTo('user.home');
    },
    //保存用户信息
    keepUser: function (user) {
        if (!user.persist) {
            user.password = '';
        }
        //id必须为int类型，否则localstorage代理不能正确存储ids
        //感谢@纳新 提醒
        user.id = 1;
        var logUser = Ext.create('app.model.User', user);
        //储存到本地
        logUser.save();
    },
    //取消锁定
    onUnLock: function () {
        var me = this;
        me.formSave(config.user.unLock).then(function () {
            me.onClose();
        });
    },
    //找回密码
    onReset: function () {
        var me = this;
        me.formSave(config.user.reset);
    },
    //注册
    onRegister: function () {
        var me = this;
        me.formSave(config.user.register).then(function (response) {
            //注册成功后自动登录
            me.loginSuccess(response.data);
        });
    },

    
    setAnimation: function(el) {
        el.setHtml('<canvas id="canvas"></canvas>',true,function(){
            var canvas = document.getElementById('canvas');
                canvas.style.background = 'black';
                //获取画布
                var content = canvas.getContext('2d');

                var cw = innerWidth,ch = innerHeight;
                var dotsArr = [];
                canvas.width = cw;
                canvas.height = ch;

                (function fn(){
                    window.onresize = function(){
                        cw = innerWidth;
                        ch = innerHeight;
                        canvas.width = cw;
                        canvas.height = ch;
                    }//接收一个指向自己的函数，在事件触发的时候执行
                })();

                function Dot(){ };

                Dot.prototype = {
                    init: function(){
                        this.w = rand(0,cw);
                        this.h = rand(0,ch);
                        this.r = rand(0.2,1.5);
                        this.speedX = rand(-1,1);
                        this.speedY = rand(-1,1);
                        this.color = 'white'
                    },
                    draw: function(){
                        content.fillStyle = this.color;
                        content.beginPath();
                        content.arc(this.w,this.h,this.r,0,Math.PI*2);
                        content.fill();
                    },
                    move: function(){
                        this.w += this.speedX;
                        this.h += this.speedY;
                        if(this.w < 0 || this.w > cw){
                            this.speedX *= -1;
                        }
                        if(this.h < 0 || this.h > ch){
                            this.speedY *= -1;
                        }
                        this.draw();
                    },
                    shine: function(){
                        this.r = rand(0.5,1);
                        this.draw();
                    }
                }

                //生成点对象
                function createDots(num){
                    if(num) {
                        for (var i = num; i > 0; i--) {
                            var dots = new Dot();
                            dots.init();
                            dots.draw();
                            dotsArr.push(dots);
                        }
                    }
                }

                function Line(){ };
                Line.prototype = {
                     //星星之间的连线
                    initStarLine: function(){
                        this.colorStar = '#6699cc';
                        this.colorStop = '#9966cc';
                    },
                    //鼠标与星星之间的连线
                    initNewLine: function(){
                        this.colorStar = '#6699cc';
                        this.colorStop = '#ff6666';
                    },
                    drawLine: function(ow,oh,nw,nh){
                        var dx = ow - nw;
                        var dy = oh - nh;
                        var d = Math.sqrt(dx * dx + dy * dy);
                        if(d < 60){
                            var line = context.createLinearGradient(ow,oh,nw,nh);
                            context.beginPath();
                            context.moveTo(ow,oh);  //线开始点,
                            context.lineTo(nw,nh);  //线结束点
                            line.addColorStop(0,this.colorStar);
                            line.addColorStop(1,this.colorStop);
                            context.StrokeWidth = 1;
                            context.strokeStyle = line;
                            context.stroke();
                            context.restore();
                        }
                    }
                }

                function rand(min,max){
                    return (Math.random()*(max-min))+min;
                } 

                createDots(400);
                
                setInterval(function(){
                    content.clearRect(0,0,cw,ch);
                    for(var i of dotsArr){
                        // i.move();
                        i.shine();
                    }
                },1000/5)

        },{})
    }
});