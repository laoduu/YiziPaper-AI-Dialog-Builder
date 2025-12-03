// save-history.js - AI对话历史记录与保存功能

class AIHistoryManager {
    constructor() {
        this.outputDirName = 'output';
        this.currentFileName = '';
        this.historyFiles = [];
        this.currentFileContent = '';
    }

    // 初始化函数
    async init() {
        // 添加历史记录按钮
        this.addHistoryButton();
    }

    // 生成唯一文件名
    generateFileName(modelName) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const safeModelName = modelName.replace(/[^a-zA-Z0-9]/g, '-');
        return `ai-result-${timestamp}-${safeModelName}.md`;
    }

    // 获取完整对话历史
    getFullConversation() {
        const turns = document.querySelectorAll('.conversation-turn');
        const conversation = [];
        
        turns.forEach(turn => {
            const role = turn.getAttribute('data-role');
            const content = turn.querySelector('.content-input').value.trim();
            if (content) {
                conversation.push({ role, content });
            }
        });
        
        return conversation;
    }

    // 构建Markdown格式内容
    buildMarkdownContent(conversation, aiResponse, modelName) {
        const now = new Date();
        const formattedDate = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let markdown = `# AI生成结果 - ${formattedDate}\n`;
        markdown += `- 模型：${modelName}\n`;
        markdown += `- 生成时间：${formattedDate}\n\n`;
        markdown += `## 对话历史\n`;
        
        // 添加完整对话内容
        conversation.forEach((msg, index) => {
            const roleName = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? 'AI助手' : '系统';
            markdown += `${roleName}：${msg.content}\n\n`;
        });
        
        // 添加最新AI回复
        markdown += `## AI最新回复\n`;
        markdown += `${aiResponse}\n`;
        
        return markdown;
    }

    // 保存AI生成结果到本地存储
    saveAiResult(aiResponse) {
        try {
            // 获取当前使用的模型名称
            const modelSelect = document.getElementById('model-select');
            const modelName = modelSelect ? modelSelect.value : 'unknown-model';
            
            // 获取完整对话历史
            const conversation = this.getFullConversation();
            
            // 构建Markdown内容
            const markdownContent = this.buildMarkdownContent(conversation, aiResponse, modelName);
            
            // 生成文件名
            const fileName = this.generateFileName(modelName);
            
            console.log(`成功保存AI生成结果到历史记录: ${fileName}`);
            this.currentFileName = fileName;
            
            // 添加到本地历史记录
            this.addToLocalHistory(fileName, markdownContent);
            
            // 不再显示下载成功提示，减少用户干扰
            return true;
        } catch (error) {
            console.error('保存AI生成结果失败:', error);
            // 仅在控制台显示错误，不再弹出提示
            console.error('保存AI生成结果失败：', error.message);
            return false;
        }
    }
    
    // 添加到本地历史记录
    addToLocalHistory(fileName, content) {
        try {
            // 获取现有历史记录
            const history = JSON.parse(localStorage.getItem('aiHistory') || '[]');
            
            // 添加新记录
            history.push({
                fileName: fileName,
                content: content,
                timestamp: Date.now()
            });
            
            // 只保留最近100条记录
            if (history.length > 100) {
                history.splice(0, history.length - 100);
            }
            
            // 保存到本地存储
            localStorage.setItem('aiHistory', JSON.stringify(history));
        } catch (error) {
            console.error('添加到本地历史记录失败:', error);
        }
    }

    // 添加历史记录按钮
    addHistoryButton() {
        // 查找AI输出预览版块的按钮容器
        const aiPreviewSection = document.getElementById('ai-preview-section');
        const buttonContainer = aiPreviewSection.querySelector('.flex.justify-end.gap-2');
        if (!buttonContainer) {
            console.error('未找到AI输出预览版块的按钮容器');
            return;
        }
        
        // 创建历史记录按钮
        const historyButton = document.createElement('button');
        historyButton.id = 'history-button';
        historyButton.className = 'px-4 py-2 glass-btn flex items-center justify-center gap-2';
        historyButton.innerHTML = '<i class="fa fa-history"></i> <span>历史记录</span>';
        
        // 添加点击事件
        historyButton.addEventListener('click', () => {
            this.showHistoryDialog();
        });
        
        // 插入到复制结果按钮右侧
        const copyButton = buttonContainer.querySelector('#copy-ai-response');
        if (copyButton) {
            copyButton.insertAdjacentElement('afterend', historyButton);
        } else {
            buttonContainer.appendChild(historyButton);
        }
    }

    // 显示历史记录弹窗
    showHistoryDialog() {
        // 创建弹窗HTML
        const dialogHTML = `
            <div id="history-dialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div class="glass-effect dark:glass-effect-dark rounded-2xl p-6 max-w-7xl w-full mx-4 h-[80vh] flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-white">历史记录</h3>
                        <button id="close-history-dialog" class="p-2 rounded-full hover:bg-white/10 dark:hover:bg-slate-700/20">
                            <i class="fa fa-times text-slate-500 dark:text-slate-400"></i>
                        </button>
                    </div>
                    
                    <div class="flex flex-1 overflow-hidden">
                        <!-- 左侧文件列表 -->
                        <div class="w-1/4 border-r border-white/20 dark:border-slate-700/50 p-4 overflow-y-auto scrollbar-hide">
                            <div class="flex mb-4">
                                <input type="text" id="history-search" placeholder="搜索文件..." class="w-full px-3 py-2 rounded-lg glass-input input-focus">
                            </div>
                            <div id="history-file-list" class="space-y-2">
                                <!-- 文件列表将通过JavaScript动态生成 -->
                            </div>
                        </div>
                        
                        <!-- 右侧内容区域 -->
                        <div class="w-3/4 p-4 flex flex-col">
                            <!-- 预览模式切换 -->
                            <div class="flex justify-end mb-4">
                                <div class="relative inline-flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0">
                                    <span id="history-mode-slider" class="absolute left-0 top-0 bg-klein-blue dark:bg-hermes-orange rounded-lg transition-all duration-300 transform translate-x-full w-1/2 h-full"></span>
                                    <button id="history-edit-mode" class="relative z-10 px-5 py-1 text-sm font-medium rounded-lg transition-all duration-300 text-slate-600 dark:text-slate-300">
                                        <i class="fa fa-pencil mr-2"></i>编辑模式
                                    </button>
                                    <button id="history-preview-mode" class="relative z-10 px-5 py-1 text-sm font-medium rounded-lg transition-all duration-300 text-white">
                                        <i class="fa fa-eye mr-2"></i>预览模式
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 编辑区域 -->
                            <div class="mb-4 flex-1 overflow-hidden">
                                <textarea id="history-content-edit" class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 h-full resize-y input-focus text-slate-800 dark:text-white scrollbar-hide hidden"></textarea>
                                <div id="history-content-preview" class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 h-full overflow-y-auto text-slate-800 dark:text-white scrollbar-hide"></div>
                            </div>
                            
                            <!-- 操作按钮 -->
                            <div class="flex justify-end gap-3">
                                <button id="delete-history-file" class="px-4 py-2 glass-btn">删除</button>
                                <button id="save-history-file" class="px-4 py-2 glass-btn">保存</button>
                                <button id="download-history-file" class="px-4 py-2 glass-btn bg-klein-blue dark:bg-hermes-orange text-white">下载</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加弹窗到页面
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // 加载历史文件列表
        this.loadHistoryFiles();
        
        // 绑定弹窗事件
        this.bindHistoryDialogEvents();
    }

    // 加载历史文件列表
    loadHistoryFiles() {
        try {
            const fileListContainer = document.getElementById('history-file-list');
            fileListContainer.innerHTML = '<p class="text-slate-500 dark:text-slate-400">加载中...</p>';
            
            // 从本地存储获取历史记录
            const history = JSON.parse(localStorage.getItem('aiHistory') || '[]');
            
            // 按时间倒序排序
            this.historyFiles = history.sort((a, b) => b.timestamp - a.timestamp);
            
            // 渲染文件列表
            this.renderFileList();
        } catch (error) {
            console.error('加载历史文件列表失败:', error);
            document.getElementById('history-file-list').innerHTML = '<p class="text-red-500">加载失败</p>';
        }
    }

    // 渲染文件列表
    renderFileList() {
        const fileListContainer = document.getElementById('history-file-list');
        
        if (this.historyFiles.length === 0) {
            fileListContainer.innerHTML = '<p class="text-slate-500 dark:text-slate-400">暂无历史记录</p>';
            return;
        }
        
        let html = '';
        this.historyFiles.forEach(file => {
            const date = new Date(file.timestamp);
            const formattedDate = date.toLocaleString('zh-CN');
            html += `
                <div class="history-file-item p-3 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/20 cursor-pointer transition-all duration-200 ${this.currentFileName === file.fileName ? 'bg-white/10 dark:bg-slate-700/30' : ''}" data-filename="${file.fileName}">
                    <div class="font-medium text-slate-800 dark:text-white truncate">${file.fileName}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">${formattedDate}</div>
                </div>
            `;
        });
        
        fileListContainer.innerHTML = html;
        
        // 绑定文件点击事件
        fileListContainer.querySelectorAll('.history-file-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.filename;
                this.loadFileContent(filename);
            });
        });
    }

    // 加载文件内容
    loadFileContent(filename) {
        try {
            const file = this.historyFiles.find(f => f.fileName === filename);
            if (!file) {
                console.error('文件不存在:', filename);
                return;
            }
            
            // 更新当前文件状态
            this.currentFileName = filename;
            this.currentFileContent = file.content;
            
            // 更新UI
            this.renderFileList(); // 更新文件列表选中状态
            this.updateContentDisplay(); // 更新内容显示
        } catch (error) {
            console.error('加载文件内容失败:', error);
        }
    }

    // 更新内容显示
    updateContentDisplay() {
        const editArea = document.getElementById('history-content-edit');
        const previewArea = document.getElementById('history-content-preview');
        const previewModeBtn = document.getElementById('history-preview-mode');
        
        // 更新编辑区域内容
        editArea.value = this.currentFileContent;
        
        // 根据当前激活的模式更新预览内容
        if (!editArea.classList.contains('hidden')) {
            // 当前是编辑模式，不需要更新预览
        } else {
            // 当前是预览模式，更新预览内容
            previewArea.innerHTML = window.renderMarkdown(this.currentFileContent);
        }
    }

    // 绑定历史记录弹窗事件
    bindHistoryDialogEvents() {
        // 关闭弹窗
        document.getElementById('close-history-dialog').addEventListener('click', () => {
            this.closeHistoryDialog();
        });
        
        // 点击弹窗外部关闭
        document.getElementById('history-dialog').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeHistoryDialog();
            }
        });
        
        // 模式切换
        const editModeBtn = document.getElementById('history-edit-mode');
        const previewModeBtn = document.getElementById('history-preview-mode');
        const slider = document.getElementById('history-mode-slider');
        const editArea = document.getElementById('history-content-edit');
        const previewArea = document.getElementById('history-content-preview');
        
        editModeBtn.addEventListener('click', () => {
            editArea.classList.remove('hidden');
            previewArea.classList.add('hidden');
            slider.style.transform = 'translateX(0)';
            editModeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
            editModeBtn.classList.add('text-white');
            previewModeBtn.classList.remove('text-white');
            previewModeBtn.classList.add('text-slate-600', 'dark:text-slate-300');
        });
        
        previewModeBtn.addEventListener('click', () => {
            editArea.classList.add('hidden');
            previewArea.classList.remove('hidden');
            slider.style.transform = 'translateX(100%)';
            previewModeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
            previewModeBtn.classList.add('text-white');
            editModeBtn.classList.remove('text-white');
            editModeBtn.classList.add('text-slate-600', 'dark:text-slate-300');
            
            // 更新预览内容
            previewArea.innerHTML = window.renderMarkdown(editArea.value);
        });
        
        // 保存文件
        document.getElementById('save-history-file').addEventListener('click', () => {
            this.saveHistoryFile();
        });
        
        // 删除文件
        document.getElementById('delete-history-file').addEventListener('click', () => {
            this.deleteHistoryFile();
        });
        
        // 下载文件
        document.getElementById('download-history-file').addEventListener('click', () => {
            this.downloadHistoryFile();
        });
        
        // 搜索功能
        document.getElementById('history-search').addEventListener('input', (e) => {
            this.searchHistoryFiles(e.target.value);
        });
        
        // 编辑区域内容变化时更新当前文件内容
        document.getElementById('history-content-edit').addEventListener('input', (e) => {
            this.currentFileContent = e.target.value;
        });
    }

    // 切换历史记录查看模式
    switchHistoryMode(mode) {
        const editModeBtn = document.getElementById('history-edit-mode');
        const previewModeBtn = document.getElementById('history-preview-mode');
        const slider = document.getElementById('history-mode-slider');
        const editArea = document.getElementById('history-content-edit');
        const previewArea = document.getElementById('history-content-preview');
        
        if (mode === 'edit') {
            // 切换到编辑模式
            editArea.classList.remove('hidden');
            previewArea.classList.add('hidden');
            slider.style.transform = 'translateX(0)';
            editModeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
            editModeBtn.classList.add('text-white');
            previewModeBtn.classList.remove('text-white');
            previewModeBtn.classList.add('text-slate-600', 'dark:text-slate-300');
        } else {
            // 切换到预览模式
            editArea.classList.add('hidden');
            previewArea.classList.remove('hidden');
            slider.style.transform = 'translateX(100%)';
            previewModeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
            previewModeBtn.classList.add('text-white');
            editModeBtn.classList.remove('text-white');
            editModeBtn.classList.add('text-slate-600', 'dark:text-slate-300');
            
            // 更新预览内容
            previewArea.innerHTML = window.renderMarkdown(this.currentFileContent);
        }
    }

    // 保存历史文件修改
    saveHistoryFile() {
        if (!this.currentFileName || !this.currentFileContent) {
            alert('请先选择一个文件并编辑内容');
            return;
        }
        
        try {
            // 获取现有历史记录
            const history = JSON.parse(localStorage.getItem('aiHistory') || '[]');
            
            // 更新文件内容
            const index = history.findIndex(f => f.fileName === this.currentFileName);
            if (index !== -1) {
                history[index].content = this.currentFileContent;
                history[index].timestamp = Date.now();
                
                // 保存到本地存储
                localStorage.setItem('aiHistory', JSON.stringify(history));
                
                // 更新当前文件列表
                this.loadHistoryFiles();
                
                alert('文件保存成功');
            } else {
                alert('文件不存在');
            }
        } catch (error) {
            console.error('保存文件失败:', error);
            alert('保存文件失败: ' + error.message);
        }
    }

    // 删除历史文件
    deleteHistoryFile() {
        if (!this.currentFileName) {
            alert('请先选择一个文件');
            return;
        }
        
        if (!confirm('确定要删除该文件吗？')) {
            return;
        }
        
        try {
            // 获取现有历史记录
            const history = JSON.parse(localStorage.getItem('aiHistory') || '[]');
            
            // 过滤掉要删除的文件
            const updatedHistory = history.filter(f => f.fileName !== this.currentFileName);
            
            // 保存到本地存储
            localStorage.setItem('aiHistory', JSON.stringify(updatedHistory));
            
            // 更新文件列表
            this.loadHistoryFiles();
            
            // 清空当前文件状态
            this.currentFileName = '';
            this.currentFileContent = '';
            
            // 清空内容区域
            document.getElementById('history-content-edit').value = '';
            document.getElementById('history-content-preview').innerHTML = '';
            
            alert('文件删除成功');
        } catch (error) {
            console.error('删除文件失败:', error);
            alert('删除文件失败: ' + error.message);
        }
    }
    
    // 下载历史文件
    downloadHistoryFile() {
        if (!this.currentFileName || !this.currentFileContent) {
            alert('请先选择一个文件');
            return;
        }
        
        try {
            // 创建Blob对象
            const blob = new Blob([this.currentFileContent], { type: 'text/markdown;charset=utf-8' });
            
            // 创建下载链接
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = this.currentFileName;
            
            // 模拟点击下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            alert(`文件下载成功：${this.currentFileName}`);
        } catch (error) {
            console.error('下载文件失败:', error);
            alert('下载文件失败: ' + error.message);
        }
    }

    // 搜索历史文件
    searchHistoryFiles(query) {
        const fileListContainer = document.getElementById('history-file-list');
        const fileItems = fileListContainer.querySelectorAll('.history-file-item');
        
        fileItems.forEach(item => {
            const filename = item.dataset.filename;
            if (filename.toLowerCase().includes(query.toLowerCase())) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    // 关闭历史记录弹窗
    closeHistoryDialog() {
        const dialog = document.getElementById('history-dialog');
        if (dialog) {
            dialog.remove();
        }
    }
}

// 暴露saveAiResult方法给全局，以便在主文件中调用
window.saveAiResult = async (aiResponse) => {
    if (window.aiHistoryManager) {
        await window.aiHistoryManager.saveAiResult(aiResponse);
    }
};

// 初始化历史记录管理器 - 在DOM完全加载后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiHistoryManager = new AIHistoryManager();
        window.aiHistoryManager.init();
    });
} else {
    // DOM已经加载完成，直接初始化
    window.aiHistoryManager = new AIHistoryManager();
    window.aiHistoryManager.init();
};