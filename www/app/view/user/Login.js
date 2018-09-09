//视图
//登录页
Ext.define('app.view.user.Login', {
    extend: 'app.view.widget.LockingWindow',
    xtype: 'login',
    requires: ['Ext.form.field.Checkbox'],
    controller: 'user',
    listeners: {
        //监听页面初始化事件
        render: 'onLoginRender'
    },
    header: false,
    
    defaultFocus: 'authdialog',
    items: [{
        xtype: 'authdialog',
        //默认提交按钮
        defaultButton: 'loginButton',
        //自动填充
        autoComplete: true,
        bodyPadding: '68 120',
        width: 620,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            margin: '5 0'
        },
        items: [{
            xtype: 'label',
            text: '登陆律链SAAS系统',
            style: {
                "textAlign": 'center',
                "fontSize" : '18px',
                "color" : '#55595E',
                "fontWeight" : "bold",
                "paddingBottom" : "30px"
            }
        },
        {
            xtype: 'textfield',
            cls: 'auth-textbox',
            name: 'userid',
            bind: '{userid}',
            fieldLabel: '用户名',
            hideLabel: true,
            allowBlank: false,
        },
        {
            xtype: 'textfield',
            cls: 'auth-textbox',
            hideLabel: true,
            fieldLabel: '密码',
            inputType: 'password',
            name: 'password',
            bind: '{password}',
            allowBlank: false,  //不允许空白
        },
        {
            xtype: 'container',
            layout: 'hbox',
            items: [{
                xtype: 'checkboxfield',
                flex: 1,
                cls: 'form-panel-font-color rememberMeCheckbox',
                height: 30,
                inputValue: 1,
                name: 'persist',
                bind: '{persist}',
                boxLabel: '记住我'
            },
            {
                xtype: 'box',
                html: '<a href="#view.userreset"> 忘记密码 ?</a>'
            }]
        },
        {
            xtype: 'button',
            reference: 'loginButton',
            scale: 'large',
            ui: 'soft-green',
            text: '登录',
            formBind: true,
            listeners: {
                click: 'onLoginClick'
            }
        },
        {
            xtype: 'box',
            html: '<div class="outer-div"><div class="seperator">如果没有账号，<a href="#view.register">点此注册</a></div></div>',
        }]
    }]
});