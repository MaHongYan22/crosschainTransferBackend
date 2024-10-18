document.addEventListener('DOMContentLoaded', function() {
    // 发送 AJAX 请求到后端获取用户信息
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/getUserInfo', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            const userData = JSON.parse(xhr.responseText);
            // 将获取的数据显示在文本框中
            document.getElementById('username').value = userData[0].username;
            document.getElementById('password').value = userData[0].password;
            document.getElementById('age').value = userData[0].age;
        } else {
            console.error('请求出错');
        }
    };

    xhr.send();
});





document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('passwordForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const age = document.getElementById('age').value;

        const data = {
            username: username,
            password: password,
            age: age
        };

        // 发送 AJAX 请求
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/updateUser', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                alert(response.message); // 可以根据需要处理返回的数据
                window.location.href = '/user'; // 假设用户界面的 URL 是 '/user'
            } else {
                console.error('请求出错');
            }
        };

        xhr.send(JSON.stringify(data));
    });
});