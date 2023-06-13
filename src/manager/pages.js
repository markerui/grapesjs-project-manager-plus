import UI from '../utils/ui';

export default class PagesApp extends UI {
    constructor(editor, opts = {}) {
        super(editor, opts);
        this.addPage = this.addPage.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.copyPage = this.copyPage.bind(this);
        this.removePage = this.removePage.bind(this);
        this.isSelected = this.isSelected.bind(this);
        // this.handleEditInput = this.handleEditInput.bind(this);
        this.openEdit = this.openEdit.bind(this);

        /* Set initial app state */
        this.state = {
            editablePageId: '',
            isShowing: true,
            pageInfo: {
                name: '',
                title: '',
                keywords: '',
                description: '',
                pageSetting: ''
            },
            pages: [],
            loading: false
        };
    }

    get editableId() {
        return this.state.editablePageId;
    }

    onRender() {
        const { pm, setState, editor } = this;
        setState({
            loading: true
        });
        setState({
            pages: [...pm.getAll()]
        });
        editor.on('page', () => {
            setState({
                pages: [...pm.getAll()]
            })
        });
        setState({
            loading: false
        });
    }

    isSelected(page) {
        return this.pm.getSelected().id === page.id;
    }

    selectPage(e) {
        this.pm.select(e.currentTarget.dataset.key);
        this.update();
    }

    copyPage(e) {
        const pageKey = e.currentTarget.dataset.key
        const { pm } = this;
        const page = pm.get(pageKey);
        const component = page.getMainComponent();
        const pageName = page.get('name') || pageKey
        pm.add({
            name: `${pageName}-copy`,
            component
        });
        this.update();
    }

    removePage(e) {
        if (this.opts.confirmDeleteProject()) {
            this.pm.remove(e.currentTarget.dataset.key);
            this.update();
        }
    }

    openEdit(e) {
        const { editor } = this;
        this.setStateSilent({
            editablePageId: e.currentTarget.dataset.key
        });
        editor.Modal.close();
        editor.SettingsApp.setTab('page');
        editor.runCommand('open-settings');
    }

    editPage(id, options) {
        const { name, title, keywords, description, pageSetting} = options
        const currentPage = this.pm.get(id);
        currentPage?.set('name', name);
        currentPage?.set('title', title);
        currentPage?.set('keywords', keywords);
        currentPage?.set('description', description);
        currentPage?.set('pageSetting', pageSetting);
        this.update()
    }

    addPage() {
        const { pm } = this;
        const { name } = this.state.pageInfo
        if (!name) return;
        pm.add({
            name,
            component: ''
        });
        this.update();
    }

    // handleEditInput(e) {
    //     this.setStateSilent({
    //         nameText: e.target.value.trim()
    //     })
    // }


    renderPagesList() {
        const { pages, loading } = this.state;
        const { opts, isSelected } = this;

        if (loading) return opts.loader || '<div>Loading pages...</div>';

        return pages.map((page, i) => `<div 
                data-id="${i}" 
                data-key="${page.get('private') ? '' : (page.id || page.get('name'))}"  
                class="page ${isSelected(page) ? 'selected' : ''}"
            >
                <i class="fa fa-file-o" style="margin:5px;"></i>
                <div class="page-title">${page.get('name') || page.id}</div>
                <div class="page-oper">
                    ${page.get('internal') ? '' : `<span class="page-edit" data-key="${page.id || page.get('name')}"><i class="fa fa-hand-pointer-o"></i></span>`}
                    ${page.get('internal') ? '' : `<span class="page-copy" data-key="${page.id || page.get('name')}"><i class="fa fa-copy"></i></span>`}
                    ${isSelected(page) || page.get('internal') ? '' : `<span class="page-close" data-key="${page.id || page.get('name')}">&Cross;</span>`}
                </div>
            </div>`).join("\n");
    }

    update() {
        this.$el?.find('.pages').html(this.renderPagesList());
        this.$el?.find('.page').on('click', this.selectPage);
        this.$el?.find('.page-edit').on('click', this.openEdit);
        this.$el?.find('.page-copy').on('click', this.copyPage);
        this.$el?.find('.page-close').on('click', this.removePage);
    }

    render() {
        const { $, editor } = this;

        // Do stuff on render
        this.onRender();
        this.$el?.remove();

        const cont = $(`<div style="display: ${this.state.isShowing ? 'flex' : 'none'};" class="pages-wrp">
                <div class="pages">
                    ${this.renderPagesList()}
                </div>
                <div  class="flex-row">
                    <input 
                        class="tm-input sm" 
                        type="text" 
                        placeholder="${editor.I18n.t('grapesjs-project-manager.pages.placeholder')}" 
                    />
                </div>
                <div class="add-page">
                    ${editor.I18n.t('grapesjs-project-manager.pages.new')}
                </div>
            </div>`);
        cont.find('.add-page').on('click', this.addPage);
        // cont.find('input').on('change', this.handleEditInput);

        this.$el = cont;
        return cont;
    }

    get findPanel() {
        return this.editor.Panels.getPanel('views-container');
    }

    showPanel() {
        this.state.isShowing = true;
        this.findPanel?.set('appendContent', this.render()).trigger('change:appendContent');
        this.update();
    }

    hidePanel() {
        this.state.isShowing = false;
        this.render();
    }
}