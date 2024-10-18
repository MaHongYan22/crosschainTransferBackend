$.ajax({
    url: "user",
    type: "post",
    success: function(value) {
        $("tbody").empty();
        var arr = value
        console.log(value)
        for (var i = 0; i < arr.length; i++) {
            $("tbody").append("<tr>" +
                "<td><input type='checkbox' class='item' index='" + arr[i].id + "'></td>" +
                "<td>" + arr[i].id + "</td>" +
                "<td>" + arr[i].chain_id + "</td>" +
                "<td>" + arr[i].address + "</td>" +
                "<td>" + arr[i].update_time + "</td>" +

                "<td><input type='button' value='修改' class='update' index='" + arr[i].id + "'><input type='button' value='删除' class='delete' index='" + arr[i].id + "'></td>" +
                "</tr>")
        }

    },
    error: function() {
        alert("请联系管理员")
    }

})

$(".searchCondition").on("click", function() {
    var start = $(".start").val()
    var end = $(".end").val()
    $.ajax({
        url: "userSearch",
        type: "post",
        data: {
            start: start,
            end: end
        },
        async: true,
        success: function(value) {
            $("tbody").empty();

            if (value.code == 0) {

                alert(value.msg)


            } else {
                var arr = value.data

                console.log(value)
                for (var i = 0; i < arr.length; i++) {
                    $("tbody").append("<tr>" +
                        "<td><input type='checkbox' class='item' index='" + arr[i].id + "'></td>" +
                        "<td>" + arr[i].id + "</td>" +
                        "<td>" + arr[i].chain_id + "</td>" +
                        "<td>" + arr[i].address + "</td>" +
                        "<td>" + arr[i].password + "</td>" +
                        "<td>" + arr[i].update_time + "</td>" +
                        "<td><input type='button' value='修改' class='update' index='" + arr[i].id + "'><input type='button' value='删除' class='delete' index='" + arr[i].id + "'></td>" +
                        "</tr>")
                }
            }

            $(".begin").val("")
            $(".end").val("")


        },
        error: function() {
            alert("请联系管理员")
        }

    })


})
$("tbody").on("click", ".delete", function() {
    var id = $(this).attr('index')
    if (confirm("你确定要删除吗")) {
        $.ajax({
            url: "userDelete",
            type: "post",
            data: {

                id: id
            },
            async: true,
            success: function(value) {
                alert(value.msg)
                location.reload()


            },
            error: function() {
                alert("请联系管理员")
            }

        })
    } else {
        alert("取消删除！")
    }



})
$(".deleteMore").on("click", function() {
    var ids = ""

    $(".item:checked").each(function() {
        ids += $(this).attr("index") + ","
    })
    ids = ids.slice(0, -1);
    console.log(ids)
    if (confirm("你确定要删除吗")) {
        $.ajax({
            url: "userDeleteMore",
            type: "post",
            data: {

                ids: ids
            },
            async: true,
            success: function(value) {
                alert(value.msg)
                location.reload()


            },
            error: function() {
                alert("请联系管理员")
            }

        })
    } else {
        alert("取消删除！")
    }


})
$(".add").on("click", function() {

    location.href = "userAdd";
})

$(".updatePassword").on("click", function() {

    location.href = "updatePassword";
})
$("tbody").on("change", ".item", function() {
    var flag = true;
    $(".item").each(function() {
        flag &= $(this).prop("checked")
    })
    if (flag) {
        $(".checkAll").prop("checked", true)
    } else {
        $(".checkAll").prop("checked", false)
    }
})

$(".checkAll").on("change", function() {
    if ($(".checkAll").prop("checked")) {
        $(".item").prop("checked", true);
    } else {
        $(".item").prop("checked", false);
    }
})