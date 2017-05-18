function hideform() {
    $("#postform")[0].className = 'hide_btn';
    $("#postform_tbl")[0].className = 'hide';
    $("#hide")[0].className = 'hide';
    $("#show")[0].className = 'show';
}

module.exports = hideform;