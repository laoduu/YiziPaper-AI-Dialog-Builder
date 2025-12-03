// conversation-storage.js - 对话存档管理功能

class ConversationStorage {
    constructor() {
        this.storageKey = 'aiConversationArchives';
        this.maxArchives = 50; // 最大存档数量
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 获取所有存档
    getAllArchives() {
        try {
            const archives = localStorage.getItem(this.storageKey);
            return archives ? JSON.parse(archives) : [];
        } catch (error) {
            console.error('获取对话存档失败:', error);
            return [];
        }
    }

    // 保存对话存档
    saveArchive(conversation, metadata = {}) {
        try {
            // 获取当前使用的模型和API提供商
            const modelSelect = document.getElementById('model-select');
            const apiProvider = document.getElementById('api-provider');
            
            const archive = {
                id: this.generateId(),
                name: metadata.name || `对话存档_${new Date().toLocaleString('zh-CN')}`,
                timestamp: Date.now(),
                conversation: conversation,
                metadata: {
                    model: modelSelect ? modelSelect.value : 'unknown',
                    apiProvider: apiProvider ? apiProvider.value : 'unknown',
                    ...metadata
                }
            };

            // 获取现有存档
            const archives = this.getAllArchives();
            
            // 添加新存档到开头
            archives.unshift(archive);
            
            // 限制存档数量
            if (archives.length > this.maxArchives) {
                archives.splice(this.maxArchives);
            }
            
            // 保存到localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(archives));
            
            console.log('对话存档已保存:', archive);
            console.log('当前存档数量:', archives.length);
            
            return archive;
        } catch (error) {
            console.error('保存对话存档失败:', error);
            return null;
        }
    }

    // 获取单个存档
    getArchive(id) {
        try {
            const archives = this.getAllArchives();
            return archives.find(archive => archive.id === id) || null;
        } catch (error) {
            console.error('获取单个对话存档失败:', error);
            return null;
        }
    }

    // 删除存档
    deleteArchive(id) {
        try {
            const archives = this.getAllArchives();
            const updatedArchives = archives.filter(archive => archive.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(updatedArchives));
            return true;
        } catch (error) {
            console.error('删除对话存档失败:', error);
            return false;
        }
    }

    // 更新存档名称
    updateArchiveName(id, newName) {
        try {
            const archives = this.getAllArchives();
            const index = archives.findIndex(archive => archive.id === id);
            
            if (index !== -1) {
                archives[index].name = newName;
                localStorage.setItem(this.storageKey, JSON.stringify(archives));
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('更新对话存档名称失败:', error);
            return false;
        }
    }

    // 清空所有存档
    clearAllArchives() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('清空对话存档失败:', error);
            return false;
        }
    }

    // 导出存档
    exportArchive(id) {
        try {
            const archive = this.getArchive(id);
            if (archive) {
                const dataStr = JSON.stringify(archive, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${archive.name.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.json`;
                link.click();
                URL.revokeObjectURL(url);
                return true;
            }
            return false;
        } catch (error) {
            console.error('导出对话存档失败:', error);
            return false;
        }
    }

    // 导入存档
    importArchive(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            let archive;
            
            // 检查是否为直接对话数组格式
            if (Array.isArray(parsedData)) {
                // 直接对话数组格式，转换为完整存档格式
                archive = {
                    conversation: parsedData,
                    metadata: {}
                };
            } else {
                // 完整存档格式，直接使用
                archive = parsedData;
                
                // 验证存档格式
                if (!archive.conversation || !Array.isArray(archive.conversation)) {
                    throw new Error('无效的对话存档格式');
                }
            }
            
            // 生成新ID和时间戳
            archive.id = this.generateId();
            archive.timestamp = Date.now();
            archive.name = `导入的对话_${new Date().toLocaleString('zh-CN')}`;
            
            // 保存到存档列表
            const archives = this.getAllArchives();
            archives.unshift(archive);
            
            // 限制存档数量
            if (archives.length > this.maxArchives) {
                archives.splice(this.maxArchives);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(archives));
            
            return archive;
        } catch (error) {
            console.error('导入对话存档失败:', error);
            throw error;
        }
    }
}

// 暴露到全局
window.conversationStorage = new ConversationStorage();
