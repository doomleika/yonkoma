function isMobileDevice() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
}

module.exports = isMobileDevice;