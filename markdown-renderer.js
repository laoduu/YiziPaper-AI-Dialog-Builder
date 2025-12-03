// markdown-renderer.js - Markdown渲染工具

/**
 * 将Markdown文本渲染为HTML
 * @param {string} markdown - Markdown格式的文本
 * @returns {string} 渲染后的HTML字符串
 */
const renderMarkdown = (markdown) => {
    if (!markdown) return '';
    
    // 1. 替换标题（h1-h6）
    markdown = markdown.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
    markdown = markdown.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>');
    markdown = markdown.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>');
    markdown = markdown.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold mt-2 mb-1">$1</h4>');
    markdown = markdown.replace(/^##### (.*$)/gm, '<h5 class="text-sm font-bold mt-2 mb-1">$1</h5>');
    markdown = markdown.replace(/^###### (.*$)/gm, '<h6 class="text-xs font-bold mt-2 mb-1">$1</h6>');
    
    // 2. 替换粗体和斜体
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 3. 替换删除线
    markdown = markdown.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // 4. 替换链接
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">$1</a>');
    
    // 5. 替换图片
    markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg">');
    
    // 6. 替换引用块
    markdown = markdown.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-2 text-slate-600 dark:text-slate-300">$1</blockquote>');
    
    // 7. 替换分隔线
    markdown = markdown.replace(/^(---|\*\*\*|___)$/gm, '<hr class="border-t border-slate-300 dark:border-slate-600 my-4">');
    
    // 8. 替换无序列表块
    // 匹配连续的无序列表项
    const ulRegex = /(?:^(?:-|\*|\+) (.*)$\n?)+/gm;
    markdown = markdown.replace(ulRegex, (match) => {
        const items = match.trim().split('\n');
        const liHtml = items.map(item => {
            const content = item.replace(/^(?:-|\*|\+) (.*)$/, '$1');
            return `<li>${content}</li>`;
        }).join('');
        return `<ul class="list-disc pl-5 mb-2">${liHtml}</ul>`;
    });
    
    // 9. 替换有序列表块
    // 匹配连续的有序列表项
    const olRegex = /(?:^\d+\. (.*)$\n?)+/gm;
    markdown = markdown.replace(olRegex, (match) => {
        const items = match.trim().split('\n');
        const liHtml = items.map(item => {
            const content = item.replace(/^\d+\. (.*)$/, '$1');
            return `<li>${content}</li>`;
        }).join('');
        return `<ol class="list-decimal pl-5 mb-2">${liHtml}</ol>`;
    });
    
    // 10. 替换任务列表
    markdown = markdown.replace(/^- \[x\] (.*$)/gm, '<ul class="list-none pl-5 mb-2"><li class="flex items-start"><input type="checkbox" checked disabled class="mr-2 mt-1">$1</li></ul>');
    markdown = markdown.replace(/^- \[ \] (.*$)/gm, '<ul class="list-none pl-5 mb-2"><li class="flex items-start"><input type="checkbox" disabled class="mr-2 mt-1">$1</li></ul>');
    
    // 11. 替换代码块
    markdown = markdown.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-200 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>');
    markdown = markdown.replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">$1</code>');
    
    // 12. 替换表格
    // 先处理表格行
    const tableRegex = /(?:^\|.*\|$\n)+/gm;
    markdown = markdown.replace(tableRegex, (tableMatch) => {
        const lines = tableMatch.trim().split('\n');
        if (lines.length < 2) return tableMatch;
        
        let htmlTable = '<table class="border-collapse border border-slate-300 dark:border-slate-600 w-full my-4">';
        
        lines.forEach((line, index) => {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
            
            if (index === 1 && cells.every(cell => cell.match(/^[-:]+$/))) {
                // 表头分隔线，跳过
                return;
            } else if (index === 0) {
                // 表头行
                htmlTable += '<thead><tr>';
                cells.forEach(cell => {
                    htmlTable += `<th class="border border-slate-300 dark:border-slate-600 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-left">${cell}</th>`;
                });
                htmlTable += '</tr></thead><tbody>';
            } else {
                // 数据行
                htmlTable += '<tr>';
                cells.forEach(cell => {
                    htmlTable += `<td class="border border-slate-300 dark:border-slate-600 px-4 py-2">${cell}</td>`;
                });
                htmlTable += '</tr>';
            }
        });
        
        htmlTable += '</tbody></table>';
        return htmlTable;
    });
    
    // 13. 替换换行
    markdown = markdown.replace(/\n/g, '<br>');
    
    return markdown;
};

// 将renderMarkdown函数暴露给全局，以便在其他文件中调用
window.renderMarkdown = renderMarkdown;