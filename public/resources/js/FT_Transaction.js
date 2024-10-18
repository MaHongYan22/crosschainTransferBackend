var pagesize = 7

function loaddata(page) {
    var status = $(".searchStatus").val()
    var recipientAddress = $(".searchRecipient").val()
    console.log(status)
    $.ajax({
        url: "contentSearch",
        type: "post",
        data: {
            status: status,
            recipientAddress: recipientAddress,
            page: page,
            pagesize: pagesize
        },
        async: true,
        success: function(value) {
            $("tbody").empty();

            var arr = value.data

            for (var i = 0; i < arr.length; i++) {
                $("tbody").append("<tr>" +
                    "<td><input type='checkbox' class='item' index='" + arr[i].id + "'></td>" +
                    "<td>" + arr[i].id + "</td>" +
                    "<td>" + arr[i].status + "</td>" +
                    "<td>" + arr[i].senderAddress + "</td>" +
                    "<td>" + arr[i].recipientAddress + "</td>" +
                    "<td>" + arr[i].send_chain_id + "</td>" +
                    "<td>" + arr[i].recipient_chain_id + "</td>" +
                    "<td>" + arr[i].amount + "</td>" +
                    "<td>" + arr[i].create_time + "</td>" +
                    "<td><input type='button' value='修改' class='update' index='" + arr[i].id + "'><input type='button' value='删除' class='delete' index='" + arr[i].id + "'></td>" +
                    "</tr>")
            }



        },
        error: function() {
            alert("请联系管理员")
        }

    })
}

function loadpage() {
    var status = $(".searchStatus").val()
    var recipientAddress = $(".searchRecipient").val()
    console.log(status)

    $.ajax({
        url: "contentPage",
        type: "post",
        data: {
            status: status,
            recipientAddress: recipientAddress
        },
        async: true,
        success: function(value) {
            $(".pagebox").empty();
            $(".pagebox").append("<li class='first'>首页</li>")
            $(".pagebox").append("<li class='prev'>上一页</li>")
            for (var i = 0; i < Math.ceil(value.data[0].count / pagesize); i++) {
                if (i == 0) {
                    $(".pagebox").append("<li class='page current'>" + (i + 1) + "</li>")

                } else {
                    $(".pagebox").append("<li class='page'>" + (i + 1) + "</li>")
                }


            }
            $(".pagebox").append("<li class='next'>下一页</li>")
            $(".pagebox").append("<li class='last'>尾页</li>")



        },
        error: function() {
            alert("请联系管理员")
        }

    })
}
loaddata(1)
loadpage()
$(".pagebox").on("click", ".page", function() {
    //效果切换
    $(this).addClass("current").siblings().removeClass("current")
        //数据切换
    loaddata($(this).text())
})
$(".pagebox").on("click", ".prev", function() {
    //数据切换
    var currentPage = $(".pagebox .current").text() - 1
    if (currentPage < 1) {
        alert("已经是第一页了")
        return
    }
    //效果切换
    loaddata(currentPage)
    $(".pagebox .current").removeClass("current").prev().addClass("current")
})
$(".pagebox").on("click", ".next", function() {
    //数据切换
    var currentPage = parseInt($(".pagebox .current").text()) + 1
    if (currentPage > $(".page").length) {
        alert("已经是最后一页了")
        return
    }
    //效果切换
    loaddata(currentPage)
    $(".pagebox .current").removeClass("current").next().addClass("current")
})
$(".pagebox").on("click", ".first", function() {
    //数据切换
    $(".pagebox .current").removeClass("current")
    $(".pagebox .page").first().addClass("current")

    //效果切换
    loaddata(1)

})
$(".pagebox").on("click", ".last", function() {
    //数据切换
    $(".pagebox .current").removeClass("current")
    $(".pagebox .page").last().addClass("current")

    //效果切换
    loaddata($(".pagebox .page").last().text())

})

$("tbody").on("click", ".delete", function() {
    var id = $(this).attr('index')
    if (confirm("你确定要删除吗")) {
        $.ajax({
            url: "ftRecordDelete",
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
$(".crosschainFT").on("click", function() {

    location.href = "crosschainView";
})
$(".viewToken").on("click", function() {

    location.href = "viewToken";
})
$(".withdrawETH").on("click", function() {

    location.href = "withdrawETH";
})
$("tbody").on("click", ".update", function() {
    var id = $(this).attr("index")
    $.cookie("id", id)

    location.href = "router?path=contentAdd";
})

$(".searchCondition").on("click", function() {

    loaddata(1)
    loadpage()

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
            url: "content",
            type: "post",
            data: {
                action: "deleteMore",
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