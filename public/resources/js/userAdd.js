document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');

    userForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const account = document.getElementById('account').value;
        const chainId = document.getElementById('chainId').value;

        // 构建要发送的数据对象
        const data = {
            account: account,
            chainId: chainId
        };

        // 发送Ajax请求
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/addUser'); // 设置请求方法和URL
        xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);

                alert(response.msg); // 显示后端返回的消息
                // 这里可以根据后端返回的数据执行相应操作
                // 跳转到用户界面
                window.location.href = '/user'; // 假设用户界面的 URL 是 '/user'
            } else {
                console.error('添加用户时出错');
                // 这里可以处理错误情况
            }
        };
        xhr.send(JSON.stringify(data)); // 发送数据，需要将数据转换为JSON字符串
    });
});