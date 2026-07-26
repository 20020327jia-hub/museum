document.addEventListener('DOMContentLoaded', () => {
    const mapModal = document.getElementById('mapModal');
    const openMapBtn = document.getElementById('openMapBtn');
    const closeMapBtn = document.getElementById('closeMapBtn');

    // 打开地图弹窗
    openMapBtn.addEventListener('click', () => {
        mapModal.style.display = 'flex'; // 先变为 flex 布局
        // 使用 setTimeout 确保 transition 动画能够生效
        setTimeout(() => {
            mapModal.classList.add('show');
        }, 10);
    });

    // 关闭地图弹窗的功能封装
    const closeModal = () => {
        mapModal.classList.remove('show');
        // 等待淡出动画结束后再隐藏 DOM
        setTimeout(() => {
            mapModal.style.display = 'none';
        }, 300); 
    };

    // 点击 Close 按钮关闭
    closeMapBtn.addEventListener('click', closeModal);

    // 辅助交互：点击图片外部区域（遮罩层）也可以快速关闭地图
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) {
            closeModal();
        }
    });
});