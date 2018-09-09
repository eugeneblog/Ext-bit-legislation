//视图
//编辑员工类别
Ext.define('app.view.basis.category.Edit', {
    extend: 'Ext.form.Panel',
    xtype: 'basisCategoryEdit',
    controller: 'basisCategory',
    //创建一个空白视图数据源，方便绑定数据
    viewModel: {},
    listeners: {
        //树形菜单数据被选中时
        treeSelect: 'onTreeSelect',
        //页面激活时
        activate: 'onActivate'
    },
    title: '员工类别',
    bodyPadding: '0 10 10 10',
    border: true,
    //动态标题
    bind: '{data.text}',
    fieldDefaults: {
        labelWidth: 90
    },
    items: [{
        margin: '0 0 10 0',
        xtype: 'textfield',
        fieldLabel: '上级名称',
        allowBlank: false,
        readOnly: true,
        bind: '{data.parentName}'
    },
    {
        xtype: 'textfield',
        fieldLabel: '名称',
        allowBlank: false,
        name: 'name',
        bind: '{data.text}',
        maxLength: 20
    },
    {
        xtype: 'textareafield',
        fieldLabel: '备注',
        name: 'remark',
        bind: '{data.remark}',
        width: 550,
        margin: '10 0 0 0'
    }],
    tbar: [{
        text: '新增',
        handler: 'onAddClick',
        bind: {
            disabled: '{!categoryTree.selection}'
        },
        ui: 'soft-blue'
    },
    {
        text: '保存',
        handler: 'onSave',
        bind: {
            disabled: '{!categoryTree.selection}'
        },
        ui: 'soft-blue'
    },
    {
        text: '删除',
        handler: 'onDel',
        bind: {
            disabled: '{!categoryTree.selection}'
        },
        ui: 'soft-blue'
    }]
});