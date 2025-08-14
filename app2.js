var commentApi = "http://localhost:3000/courses"

start()

function start() {
    getComment(renderComment)
    handleCreateForm()
    updateCommentTime()
    setInterval(updateCommentTime, 60000)
}

function getComment(callback) {
    fetch(commentApi)
        .then(function (response) {
            return response.json()
        })
        .then(callback)
}

function renderComment(comments) {
    var listCommentBlock = document.querySelector("#list-comments")
    var htmls = comments.map(function (comment) {
        return `
            <div class="comment-card comment-item-${comment.id}">
                <div class="comment-header">
                    <span class="comment-name">${comment.name}</span>
                    <span class="comment-time" data-timestamp="${comment.createTime}">${timeAgo(comment.createTime)}</span>
                </div>
                <div class="comment-text comment-text-${comment.id}">${comment.comment}</div>
                <div class="comment-actions">
                    <button class="edit-btn" onclick="handleEditComment('${comment.id}', '${comment.name}','${comment.createTime}')">Edit</button>
                    <button class="delete-btn" onclick="handleDeleteComment('${comment.id}')">Delete</button>
                </div>
            </div>
        `
    })
    listCommentBlock.innerHTML = htmls.join("")
}


function handleCreateForm() {
    var createBtn = document.querySelector("#create")
    createBtn.onclick = function () {
        var name = document.querySelector('input[name="name"]').value
        var content = document.querySelector('input[name="comment"]').value
        var createTime = new Date().toISOString()
        var data = {
            name: name,
            comment: content,
            createTime: createTime
        }
        createComment(data)
    }
}

function createComment(data) {
    var options = {
        method: "POST",
        body: JSON.stringify(data),
    }
    fetch(commentApi, options)
        .then(function (response) {
            return response.json()
        })
        .then(function () {
            getComment(renderComment)
        })
}

function handleDeleteComment(id) {
    var options = {
        method: "DELETE"
    }
    fetch(commentApi + "/" + id, options)
        .then(function (response) {
            return response.json()
        })
        .then(function () {
            var commentItem = document.querySelector(".comment-item" + id)
            if (commentItem) {
                commentItem.remove()
            }
        })
}

function handleEditComment(id, name, time) {
    var commentText = document.querySelector(".comment-text-" + id)
    var commentAction = document.querySelector(".comment-actions")

    var originalTextHTML = commentText.innerHTML;
    var originalActionsHTML = commentAction.innerHTML;


    commentText.innerHTML = `
        <div class="edit-container">
            <input class="comment-edit-input comment-input-${id}">
            <button class="confirm-btn"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
    `
    commentAction.innerHTML = `
        <button class="cancel-btn">Cancel</button>
    `

    var inputElement = document.querySelector(".comment-input-" + id)
    inputElement.value = originalTextHTML

    document.querySelector(".cancel-btn").onclick = function () {
        commentText.innerHTML = originalTextHTML
        commentAction.innerHTML = originalActionsHTML
    }

    document.querySelector(".confirm-btn").onclick = function () {
        editComment(inputElement.value, id, name, time)
    }
}

function editComment(value, id, name, time) {
    var options = {
        method: "PUT",
        body: JSON.stringify({
            name: name,
            comment: value,
            createTime: time
        })
    }
    fetch(commentApi + "/" + id, options)
        .then(function (response) {
            return response.json()
        })
        .then(function () {
            getComment(renderComment)
        })
}

function timeAgo(timestamp) {
    const now = new Date()
    const past = new Date(timestamp)
    const seconds = Math.floor((now - past) / 1000)

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";

    return "Just now";
}

function updateCommentTime() {
    document.querySelectorAll(".comment-time").forEach(function (commentTime) {
        const timestamp = commentTime.getAttribute("data-timestamp")
        commentTime.textContent = timeAgo(timestamp)
    })
}