$(".button1").on("click", function() {
    var account = $(".account").val().trim()
    var password = $(".password").val().trim()

    $.cookie("account", account)

    if (account == "") {
        alert("用户名为空")
        return
    }
    if (password == "") {
        alert("密码为空")
        return
    }

    $.ajax({
        url: "login",

        type: "post",
        async: true,
        data: {
            account: account,
            password: password,
        },
        success: function(value) {

            if (value.code == 1) {
                alert(value.msg)
                window.location.href = 'index';
            } else {
                alert(value.msg)
            }

        },

        error: function() {
            alert("请联系管理员")
        }

    })

})