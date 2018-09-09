//扩展
//扩展ViewController
//除了核心控制器，所有的控制器都继承这个扩展控制器
Ext.define('ux.app.ViewController', {
    extend: 'Ext.app.ViewController',
    //显示返回页面
    showBackView: function (view, tmpConfig) {
        config.tmpConfig = tmpConfig;
        this.redirectTo(view);
    },

    //返回
    //非弹窗类子页面通过浏览器按钮点击返回不会触发此方法
    //所以在这里只有一个回退方法
    //如果要处理一些额外的业务逻辑，比如模型数据重置
    //监听页面的beforedestroy事件来处理就行
    onBack: function () {
        //标识一下，现在是返回模式
        config.isBack = true;
        this.historyBack();
    },
    //返回上一个路由
    historyBack: function () {
        Ext.util.History.back();
    },

    //重新加载store
    reloadStore: function () {
        //这个store是列表的store
        var store = this.getStore('store');
        if (store) {
            store.reload();
        }
    },

    //win窗口提交成功执行
    //多用于非模型提交，提交后直接刷新列表数据
    winSuccess: function () {
        this.reloadStore();
        this.onClose();
    },
    //view窗口提交成功执行
    viewSuccess: function () {
        this.reloadStore();
        this.onBack();
    },
    //弹出窗口取消
    //重置模型数据后关闭窗口
    //多用于修改场景
    onWindowChange: function () {
        this.modelReject();
        this.onClose();
    },
    //关闭弹窗
    onClose: function () {
        this.getView().close();
    },

    //form表单保存
    //默认post传值
    //isGet是否使用get方式传值
    formSave: function (url, isGet) {
        var form = this.getView(),
        deferred,
        values;
        //如果不是表单，向下查找表单控件
        if (!form.isXType('form')) {
            form = form.down('form');
        }
        if (form.isValid()) {
            values = form.getValues();
            return util.ajax(url, values, false, !isGet ? 'POST' : false);
        }
        deferred = new Ext.Deferred();
        return deferred.promise;
    },
    //返回页保存数据 链式
    viewSave: function (url) {
        var me = this;
        return me.formSave(url).then(function () {
            me.viewSuccess();
        });
    },
    //弹窗保存
    winSave: function (url) {
        var me = this;
        me.formSave(url).then(function () {
            me.winSuccess();
        });
    },
    //弹窗保存 带消息提示
    winSaveByMes: function (url, mes) {
        var me = this,
        win = me.getView(),
        form = win.down('form'),
        values;
        if (form.isValid()) {
            Ext.Msg.confirm('提示', mes,
            function (btn) {
                if (btn == 'yes') {
                    values = form.getValues();
                    util.ajaxP(url, values).then(function () {
                        me.winSuccess();
                    });
                }
            });
        }
    },

    //重置当前页模型
    modelReject: function () {
        var model = this.getViewModel().get('data');
        if (model && model.data) {
            //取消模型的更改
            model.reject();
        }
    },
    //模型保存
    //链式
    modelSave: function () {
        var me = this,
        form = me.getView(),
        deferred,
        model;
        //如果不是表单，向下查找表单控件
        if (!form.isXType('form')) {
            form = form.down('form');
        }
        //验证表单数据是否正确
        if (form.isValid()) {
            //验证模型数据
            //模型里面也可以写验证的
            //注意模型里面未定义的字段不会被提交
            model = util.validFormModel(form, me.getViewModel().get('data'));
            if (model) {
                return util.saveModel(model);
            }
        }
        deferred = new Ext.Deferred();
        return deferred.promise;
    },
    //模型保存并更新数据仓库
    //isReload  默认为无刷新添加,需要服务端返回主键id
    //          true 新增成功后直接刷新列表
    //isEditReload 默认不操作
    //          true 编辑成功后直接刷新列表 
    modelSaveByStore: function (isReload, isEditReload) {
        var me = this;
        return me.modelSave().then(function (data) {
            var store = me.getStore('store');
            //如果是新增
            if (data.phantom) {
                if (isReload) {
                    store.reload();
                } else {
                    store.add(data.rec);
                }
            } else if (isEditReload) {
                store.reload();
            }
        });
    },
    //返回页保存模型数据 链式
    //以model.save形式
    //isReload  默认为无刷新添加,需要服务端返回主键id
    //          true 新增成功后直接刷新列表
    //isEditReload 默认不操作
    //          true 编辑成功后直接刷新列表 
    viewModelSave: function (isReload, isEditReload) {
        var me = this;
        return me.modelSaveByStore(isReload, isEditReload).then(function () {
            me.onBack();
        });
    },
    //保存弹窗表单的值
    //以model.save形式
    //isReload  默认为无刷新添加,需要服务端返回主键id
    //          true 新增成功后直接刷新列表
    //isEditReload 默认不操作
    //          true 编辑成功后直接刷新列表 
    winModelSave: function (isReload, isEditReload) {
        var me = this;
        return me.modelSaveByStore(isReload, isEditReload).then(function () {
            me.onClose();
        });
    },

    //列表删除单项
    //url 请求地址
    //param 参数名称（主键名称）
    //message 消息提示
    onDelete: function (url, param, message) {
        Ext.MessageBox.confirm('删除确认', message,
        function (btnText) {
            if (btnText == 'yes') {
                var grid = this.getView(),
                rec = grid.getSelectionModel().getSelection()[0],
                values = {};
                values[param] = rec.get(param);
                if (rec) {
                    util.ajax(url, values).then(function () {
                        grid.getStore().remove(rec);
                    });
                }
            }
        },
        this);
    },

    //筛选弹窗搜索
    onGridSearchByBtn: function (t, form, values) {
        util.viewLoad(t.up('grid'), values);
    },
    //Grid查询
    //用于grid中条件查询
    searchGrid: function (btn) {
        //获取视图
        var view = btn.up('grid'),
            //取值并验证
        values = util.getViewValues(btn.up('toolbar'));
        if (values) {
            //加载数据
            util.viewLoad(view, values);
        }
    },
    //重置搜索条件
    //重置grid的搜索条件
    resetToolbar: function (item) {
        util.resetView(item.up('toolbar'));
    }
});